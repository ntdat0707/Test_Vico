## for local : #############################
create .env file, enter the config values for app
# install
npm i
//
# run miggration to sync with current database
npm run typeorm:migration:run

# start app
npm start
or npm run start:dev
# #############################################

## for cloud: #################################
create directory:

uploads -> products
       -> categories
       -> brands
change permision of uploads to 757

copy picture to these dirs

config by modifying docker-compose.yaml

docker-compose up --build
