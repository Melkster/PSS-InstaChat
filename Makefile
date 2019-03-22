CLIENT = cd client &&
SERVER = cd server &&

run_server:
	$(SERVER) npm start

run_client:
	$(CLIENT) npm start

install:
	$(SERVER) npm install --no-optional
	$(CLIENT) npm install --no-optional

test: test_server test_db test_client

test_server:
	$(SERVER) npm run test_server

test_client:
	$(CLIENT) npm test

test_db:
	$(SERVER) npm run test_db

clean: clean_db
	$(SERVER) rm -rf node_modules/
	$(CLIENT) rm -rf node_modules/

clean_db:
	$(SERVER) rm -f db/*
