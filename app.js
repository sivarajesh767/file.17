const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()

const databasePath = path.join(__dirname, 'covid19India.db')
app.use(express.json())

let database = null

const initlizeDbAndReverse = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => console.log('Server Running at http://localhost:3000/'))
  } catch (error) {
    console.log(`DB Error: {error.message}`)
    process.exit(1)
  }
}

initlizeDbAndReverse()

const convertDbObjectToReversObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  }
}

app.get('/states/', async (request, response) => {
  const getStateQuery = `
    SELECT
    *
    FROM
    state;`

  const stateArray = await database.all(getStateQuery)
  response.send(
    stateArray.map(eachState => convertDbObjectToReversObject(eachState)),
  )
})

app.get('states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getStateQuery = `
    SELECT
    *
    FROM
    state
    WHERE
    state_id = ${stateId};`

  const stateArray = await database.get(getStateQuery)
  response.send(
    stateArray.map(eachResponse => convertDbObjectToReversObject(eachResponse)),
  )
})

app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getDistrictQuery = `
  SELECT
  *
  FROM
  district
  WHERE 
  district_id = ${districtId};`

  const districtArray = await database.get(getDistrictQuery)
  response.send(
    districtArray.map(eachDistrict =>
      convertDbObjectToReversObject(eachDistrict),
    ),
  )
})

app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const getStateQuery = `
  SELECT
  *

  FROM
  state

  WHERE
  state_id = ${stateId}`

  const statArray = await database.get(getStateQuery)
  response.send(statArray.map(eachArray => convertDbObjectToReversObject(eachArray)))
})

app.get('/districts/:districtId/details/', async (request, response)=>{
  const {districtId, details} = request.body;
  const getDistrictsQuery = `
  SELECT
  *
  
  FROM
  district
  
  WHERE
  district_id = ${districtId};`

  const districtArray = await database.get(getDistrictsQuery)
  response.send(districtArray.map((eachDistrict)=>convertDbObjectToReversObject(eachArray)))
})


app.post('/districts/', async (request, response)=>{
  const { districtName, stateId, cases, curved, active, deaths } = request.body;
  const postDistrictsQuery = `
  INSERT INTO
  district( district_name, state_id, cases, curved, active, deaths )
  VALUES
  ('${ districtsName }', '${stateId}', '${cases}', '${curved}', '${active}' '${deaths}');`

  const postArray = await database.run(postDistrictsQuery)
  response.send('District Successfully Added')
})

app.put('/districts/:districtId/', async (request, response)=>{
  const {districtName, stateId, cases, curved, active, deaths }= request.body;
  const {districtId} = request.params;
  const updateDistrictsQuery = `
  UPDATE
  district
  SET
  district_name = '${districtName}',
  state_id = '${stateId}',
  cases = '${cases}',
  curved = '${curved}',
  active = '${active}',
  deaths = '${deaths}
  
  WHERE 
  district_id = ${districtId};`

  const postDistrictName = await database.run(updateDistrictsQuery)
  response.send('District Details Updated')
    
})

app.delete('/districts/:districtId/', async (request, respones)=>{
  const {districtId} = request.params;
  const deleteDistrictsQuery = `
  DELETE FROM
  district
  
  WHERE 
  district_id = ${districtId};`

  const deleteDistrictsArray = await database.run(deleteDistrictsQuery)
  response.send('District Removed')


})

module.exports = app
