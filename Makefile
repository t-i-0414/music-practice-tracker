.PHONY: setup
setup:
	bun install
	cp -n .env.example .env || echo ".env already exists"
	ln -sf ../../../.env packages/apps/backend/.env
	cd packages/apps/backend && bunx prisma migrate dev && cd -
