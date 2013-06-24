node_modules: package.json
	npm install
	touch node_modules

build:
	if [ ! -d build ]; then \
		mkdir build; \
	fi;

build/CRI_adm.zip: build
	curl http://gadm.org/data/shp/CRI_adm.zip \
		--output build/CRI_adm.zip \
		--time-cond build/CRI_adm.zip \
		--progress-bar \
		--location
	touch build/CRI_adm.zip

build/CRI_adm/CRI_adm2.shp: build/CRI_adm.zip
	unzip -u build/CRI_adm.zip CRI_adm2.* -d build/CRI_adm
	touch build/CRI_adm/CRI_adm2.shp

build/costa-rica-geo.json: build/CRI_adm/CRI_adm2.shp
	[ -f build/costa-rica-geo.json ]; then \
		rm build/costa-rica-geo.json; \
	fi;
	ogr2ogr -f GeoJSON build/costa-rica-geo.json \
		build/CRI_adm/CRI_adm2.shp

build/costa-rica-topo.json: node_modules build/costa-rica-geo.json
	@# Uses external properties file to munge in the official canton codes.
	@# https://github.com/mbostock/topojson/wiki/Command-Line-Reference#external-properties
	./node_modules/topojson/bin/topojson \
		-e data/gadm-canton-code-mappings.csv \
		--id-property=+ID_2 \
		-p code=+code \
		-q 1e4 \
		-o build/costa-rica-topo.json: \
		build/costa-rica-geo.json

gh-pages:
	if [ ! -d gh-pages ]; then \
		if git ls-remote --heads https://github.com/mattcg/tuanis.git | grep --quiet gh-pages; then \
			mkdir gh-pages; \
			cd gh-pages; \
			git clone git@github.com:mattcg/tuanis.git .; \
			git checkout --orphan gh-pages; \
			git rm -rf .; \
			echo ".DS_Store" > .gitignore; \
			git add .gitignore; \
			git ci -m "Initial commit"; \
			git push --set-upstream origin gh-pages; \
		else \
			git clone git@github.com:mattcg/tuanis.git -b gh-pages gh-pages; \
		fi; \
	else \
		cd gh-pages && git pull; \
	fi;

gh-pages/index.html: gh-pages index.html
	cp index.html gh-pages/index.html

gh-pages/og-image.jpg: gh-pages og-image.jpg
	cp og-image.jpg gh-pages/og-image.jpg

gh-pages/javascript.js: node_modules gh-pages build/costa-rica-topo.json index.js lib/*.js
	./node_modules/browserify/bin/cmd.js \
		./index.js \
		--outfile gh-pages/javascript.js \
		--require ./build/costa-rica-topo.json:costa-rica-topo
	./node_modules/uglify-js/bin/uglifyjs \
		gh-pages/javascript.js \
		--compress \
		--output gh-pages/javascript.js

public: gh-pages/index.html gh-pages/og-image.jpg gh-pages/javascript.js

publish: public
	cd gh-pages && git add . && git ci \
		-m "Automated commit from make"

.PHONY: publish public
