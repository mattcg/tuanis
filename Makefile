gh-pages:
	if [ ! -d gh-pages ]; then \
		git clone git@github.com:mattcg/tuanis.git -b gh-pages gh-pages; \
	else \
		cd gh-pages && git pull
	fi;

node_modules: package.json
	npm install

build:
	if [ ! -d build ]; then \
		mkdir build; \
	fi;

gh-pages/index.html: gh-pages index.html
	cp index.html gh-pages/index.html

gh-pages/og-image.jpg: gh-pages og-image.jpg
	cp og-image.jpg gh-pages/og-image.jpg

gh-pages/data: gh-pages
	if [ ! -d gh-pages/data ]; then \
		mkdir gh-pages/data; \
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

gh-pages/data/costa-rica-topo.json: node_modules build/costa-rica-geo.json
	@# Uses external properties file to munge in the official canton codes.
	@# https://github.com/mbostock/topojson/wiki/Command-Line-Reference#external-properties
	./node_modules/topojson/bin/topojson \
		-e data/gadm-canton-code-mappings.csv \
		--id-property=+ID_2 \
		-p code=+code \
		-q 1e4 \
		-o gh-pages/data/costa-rica-topo.json: \
		build/costa-rica-geo.json
	cd gh-pages && git ci \
		gh-pages/data/costa-rica-topo.json \
		-m "Automated commit from make"
