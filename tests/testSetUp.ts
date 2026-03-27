beforeAll(async () => {
  console.log('Running before all')
  console.log = () => {};


});

afterAll(async () => {
  console.log = console.log;
});
