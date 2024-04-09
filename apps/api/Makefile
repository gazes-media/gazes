.PHONY: dev build start

dev:
	@docker compose up -d 
	@pnpm run dev

build:
	@pnpm run build

start: build
	@node dist/index.js

# db pull prisma
db/pull:
	@npx prisma db pull dev

db/migrate:
	@npx prisma migrate dev