// Automated backend verification script
const baseURL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('--- Starting Backend Verification Tests ---');
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`PASS: ${testName}`);
      passed++;
    } else {
      console.error(`FAIL: ${testName} - ${details}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const healthRes = await fetch('http://localhost:5000/health');
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ok', 'Health check returns 200 and ok');

    // 2. POST /tasks (missing title) -> 400
    const emptyTitleRes = await fetch(`${baseURL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '   ' }),
    });
    const emptyTitleData = await emptyTitleRes.json();
    assert(
      emptyTitleRes.status === 400 && emptyTitleData.success === false,
      'POST with whitespace title returns 400'
    );

    // 3. POST /tasks (invalid priority) -> 400
    const badPriorityRes = await fetch(`${baseURL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test Task', priority: 'extreme' }),
    });
    const badPriorityData = await badPriorityRes.json();
    assert(
      badPriorityRes.status === 400 && badPriorityData.success === false,
      'POST with invalid priority returns 400'
    );

    // 4. POST /tasks (invalid status) -> 400
    const badStatusRes = await fetch(`${baseURL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test Task', status: 'finished' }),
    });
    const badStatusData = await badStatusRes.json();
    assert(
      badStatusRes.status === 400 && badStatusData.success === false,
      'POST with invalid status returns 400'
    );

    // 5. POST /tasks (valid task 1 - high priority, todo, with due date)
    const task1Res = await fetch(`${baseURL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'High Priority Task',
        description: 'Urgent task description',
        priority: 'high',
        status: 'todo',
        dueDate: '2026-11-15T00:00:00.000Z',
      }),
    });
    const task1Data = await task1Res.json();
    assert(task1Res.status === 201 && task1Data.data.title === 'High Priority Task', 'POST valid task 1 returns 201');
    const task1Id = task1Data.data._id;

    // 6. POST /tasks (valid task 2 - low priority, in_progress, no due date)
    const task2Res = await fetch(`${baseURL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Low Priority Task',
        description: 'Casual task description',
        priority: 'low',
        status: 'in_progress',
      }),
    });
    const task2Data = await task2Res.json();
    assert(task2Res.status === 201 && task2Data.data.priority === 'low', 'POST valid task 2 returns 201');
    const task2Id = task2Data.data._id;

    // 7. POST /tasks (valid task 3 - medium priority, done, earlier due date)
    const task3Res = await fetch(`${baseURL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Medium Priority Task',
        priority: 'medium',
        status: 'done',
        dueDate: '2026-11-10T00:00:00.000Z',
      }),
    });
    const task3Data = await task3Res.json();
    assert(task3Res.status === 201 && task3Data.data.status === 'done', 'POST valid task 3 returns 201');
    const task3Id = task3Data.data._id;

    // 8. GET /tasks (all)
    const allRes = await fetch(`${baseURL}/tasks`);
    const allData = await allRes.json();
    assert(allRes.status === 200 && Array.isArray(allData.data) && allData.data.length >= 3, 'GET /tasks returns array');

    // 9. GET /tasks?status=in_progress
    const inProgressRes = await fetch(`${baseURL}/tasks?status=in_progress`);
    const inProgressData = await inProgressRes.json();
    const allAreInProgress = inProgressData.data.every((t) => t.status === 'in_progress');
    assert(inProgressRes.status === 200 && allAreInProgress && inProgressData.data.length >= 1, 'GET /tasks?status=in_progress filters correctly');

    // 10. GET /tasks?sortBy=priority&order=desc
    const prioritySortRes = await fetch(`${baseURL}/tasks?sortBy=priority&order=desc`);
    const prioritySortData = await prioritySortRes.json();
    const rankMap = { high: 3, medium: 2, low: 1 };
    let correctlyRanked = true;
    for (let i = 0; i < prioritySortData.data.length - 1; i++) {
      if (rankMap[prioritySortData.data[i].priority] < rankMap[prioritySortData.data[i + 1].priority]) {
        correctlyRanked = false;
        break;
      }
    }
    assert(prioritySortRes.status === 200 && correctlyRanked, 'GET /tasks?sortBy=priority&order=desc ranks high > medium > low');

    // 11. GET /tasks?sortBy=dueDate
    const dueDateSortRes = await fetch(`${baseURL}/tasks?sortBy=dueDate&order=asc`);
    const dueDateSortData = await dueDateSortRes.json();
    const lastItemsHaveNoDueDate = dueDateSortData.data[dueDateSortData.data.length - 1].dueDate === null;
    assert(dueDateSortRes.status === 200 && lastItemsHaveNoDueDate, 'GET /tasks?sortBy=dueDate puts null due date last');

    // 12. GET /tasks/:id (existing)
    const getSingleRes = await fetch(`${baseURL}/tasks/${task1Id}`);
    const getSingleData = await getSingleRes.json();
    assert(getSingleRes.status === 200 && getSingleData.data._id === task1Id, 'GET /tasks/:id returns task');

    // 13. GET /tasks/:id (invalid id) -> 400
    const badIdRes = await fetch(`${baseURL}/tasks/123-invalid`);
    const badIdData = await badIdRes.json();
    assert(badIdRes.status === 400 && badIdData.error.message.includes('Invalid task id'), 'GET /tasks/badId returns 400');

    // 14. GET /tasks/:id (non-existent valid ObjectId) -> 404
    const notFoundRes = await fetch(`${baseURL}/tasks/6650f1c2a1b2c3d4e5f60789`);
    const notFoundData = await notFoundRes.json();
    assert(notFoundRes.status === 404 && notFoundData.error.message === 'Task not found', 'GET /tasks/nonExistent returns 404');

    // 15. PUT /tasks/:id (update status to in_progress)
    const updateRes = await fetch(`${baseURL}/tasks/${task1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_progress' }),
    });
    const updateData = await updateRes.json();
    assert(
      updateRes.status === 200 &&
        updateData.data.status === 'in_progress' &&
        updateData.data.title === 'High Priority Task',
      'PUT /tasks/:id updates status and preserves other fields'
    );

    // 16. PUT /tasks/:id (empty body) -> 400
    const emptyPutRes = await fetch(`${baseURL}/tasks/${task1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(emptyPutRes.status === 400, 'PUT /tasks/:id with empty body returns 400');

    // 17. DELETE /tasks/:id
    const deleteRes = await fetch(`${baseURL}/tasks/${task1Id}`, {
      method: 'DELETE',
    });
    const deleteData = await deleteRes.json();
    assert(deleteRes.status === 200 && deleteData.success === true, 'DELETE /tasks/:id deletes task');

    // 18. DELETE /tasks/:id again -> 404
    const deleteAgainRes = await fetch(`${baseURL}/tasks/${task1Id}`, {
      method: 'DELETE',
    });
    assert(deleteAgainRes.status === 404, 'DELETE /tasks/:id a second time returns 404');

    // 19. Clean up test tasks 2 and 3
    await fetch(`${baseURL}/tasks/${task2Id}`, { method: 'DELETE' });
    await fetch(`${baseURL}/tasks/${task3Id}`, { method: 'DELETE' });

    // 20. Unknown route -> 404
    const unknownRouteRes = await fetch('http://localhost:5000/api/unknown-endpoint');
    assert(unknownRouteRes.status === 404, 'Unknown route returns 404');

    console.log(`\n--- Backend Test Results: ${passed} passed, ${failed} failed ---`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err.message);
    process.exit(1);
  }
};

runTests();
