public: gh-pages/index.html gh-pages/img gh-pages/js/app.js gh-pages/css/app.css gh-pages/svg/costa-rica.svg

node_modules: package.json
	npm install
	touch node_modules

build:
	if [ ! -d build ]; then \
		mkdir build; \
	else \
		touch build; \
	fi;

build/CRI_adm.zip: build
	curl http://gadm.org/data/shp/CRI_adm.zip \
		--output build/CRI_adm.zip \
		--progress-bar \
		--location
	touch build/CRI_adm.zip

build/CRI_adm/CRI_adm2.shp: build/CRI_adm.zip
	unzip -u build/CRI_adm.zip CRI_adm2.* -d build/CRI_adm
	touch build/CRI_adm/CRI_adm2.shp

build/map.css: node_modules build lib/less/map.less
	./node_modules/less/bin/lessc \
		--compress \
		lib/less/map.less \
		build/map.css

gh-pages:
	if [ ! -d gh-pages ]; then \
		if git ls-remote --heads https://github.com/mattcg/tuanis.git | grep --quiet gh-pages; then \
			git clone git@github.com:mattcg/tuanis.git -b gh-pages gh-pages; \
		else \
			mkdir gh-pages; \
			cd gh-pages; \
			git clone git@github.com:mattcg/tuanis.git .; \
			git checkout --orphan gh-pages; \
			git rm -rf .; \
			echo ".DS_Store" > .gitignore; \
			git add .gitignore; \
			git ci -m "Initial commit"; \
			git push --set-upstream origin gh-pages; \
		fi; \
	else \
		cd gh-pages && git pull; \
	fi;

gh-pages/index.html: gh-pages lib/html/app.html
	cp lib/html/app.html gh-pages/index.html

gh-pages/img: gh-pages lib/img/*
	if [ ! -d gh-pages/img ]; then \
		mkdir gh-pages/img; \
	else \
		touch gh-pages/img; \
	fi;
	cp lib/img/* gh-pages/img/

gh-pages/svg: gh-pages
	if [ ! -d gh-pages/svg ]; then \
		mkdir gh-pages/svg; \
	else \
		touch gh-pages/svg; \
	fi;

gh-pages/svg/costa-rica.svg: build/CRI_adm/CRI_adm2.shp gh-pages/svg build/map.css kartograph.json
	kartograph kartograph.json \
		--style build/map.css \
		--output gh-pages/svg/costa-rica.svg

gh-pages/js: gh-pages
	if [ ! -d gh-pages/js ]; then \
		mkdir gh-pages/js; \
	else \
		touch gh-pages/js; \
	fi;

gh-pages/js/app.js: node_modules gh-pages/js lib/js/*
	./node_modules/browserify/bin/cmd.js \
		./lib/js/app.js \
		--outfile gh-pages/js/app.js
	#./node_modules/uglify-js/bin/uglifyjs \
	#	gh-pages/js/app.js \
	#	--compress \
	#	--output gh-pages/js/app.js

gh-pages/css: gh-pages
	if [ ! -d gh-pages/css ]; then \
		mkdir gh-pages/css; \
	else \
		touch gh-pages/css; \
	fi;

gh-pages/css/app.css: node_modules gh-pages/css lib/less/*.less
	./node_modules/less/bin/lessc \
		--compress \
		lib/less/app.less \
		gh-pages/css/app.css

publish: public
	cd gh-pages && git add . && \
	git ci \
		-m "Automated commit from make" && \
	git push

clean:
	rm -rf build
	cd gh-pages && git reset --hard && git clean -df

.PHONY: publish public clean
