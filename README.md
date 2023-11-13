# Calendar-App
1) Install docker, https://docs.docker.com/get-docker/
2) Create a Postgres DB, I called it stepful, you can name it differently, make sure to update the apps/api/src/database/database.module.ts to match your DB name.
3) Install dependencies by running npm install at 3 different locations: 
  3.1) nest-react folder,
  3.2) cd apps/client folder
  3.3) cd apps/api folder,
4) run the docker: 
   cd apps/api docker compose up
5) cd nest-react run: npm run build && npm start
