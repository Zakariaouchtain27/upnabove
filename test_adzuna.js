const ADZUNA_APP_ID = "d9af5443";
const ADZUNA_APP_KEY = "e7fe9e7d0cd07f0e20b7d8c1a5bbb978";

async function test() {
  const url = `https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=1`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
