CLIENT = cd client &&
SERVER = cd server &&

run_server:
	$(SERVER) npm start

run_client:
	$(CLIENT) npm start

install:
	$(SERVER) npm install --no-optional
	$(CLIENT) npm install --no-optional

clean:
	$(SERVER) rm -f db/
	$(CLIENT) rm -f client/
	$(SERVER) rm -rf node_modules/
	$(CLIENT) rm -rf node_modules/

clean_db:
	$(SERVER) rm -f db/*
