<div align="center">
  <h1>gdal3.js</h1>
<p align="center">
  <strong>Gdal compiled to JavaScript</strong><br>
  WebAssembly & React Native
</p>

<a href="https://www.npmjs.com/package/gdal3.js"><img alt="gdal3.js npm version" src="https://img.shields.io/npm/v/gdal3.js?style=for-the-badge&label=gdal3.js" /></a>
<a href="https://www.npmjs.com/package/@gdal3.js/prebuilt"><img alt="@gdal3.js/prebuilt npm version" src="https://img.shields.io/npm/v/@gdal3.js/prebuilt?style=for-the-badge&label=@gdal3.js/prebuilt" /></a>
</div>

## Introduction

Gdal3.js is a port of Gdal to Webassembly and React Native. It allows you to convert raster and vector geospatial data to various formats and coordinate systems.

Gdal3.js includes Gdal, Proj, Geos, Spatialite, Sqlite, Geotiff, Tiff, Webp, Expat, Zlib and Iconv libraries.

## Supported Formats

### Raster
**Read & Write** \
AAIGrid, ADRG, ARG, BLX, BMP, BT, BYN, CALS, CTable2, DTED, EHdr, ELAS, ENVI, ERS, FIT, GIF, GPKG, GRIB, GS7BG, GSAG, GSBG, GTX, GTiff, HF2, HFA, ILWIS, ISCE, ISIS2, ISIS3, JPEG, KMLSUPEROVERLAY, KRO, LAN, LCP, Leveller, MBTiles, MEM, MFF, MFF2, MRF, NITF, NTv2, NWT_GRD, OpenFileGDB, PAux, PCIDSK, PCRaster, PDS4, PNG, PNM, R, RMF, ROI_PAC, RRASTER, RST, Rasterlite, SAGA, SGI, SIGDEM, SRTMHGT, Terragen, USGSDEM, VICAR, VRT, WEBP, WMTS, XPM, XYZ, ZMap, Zarr

**Read Only** \
ACE2, AIG, AirSAR, BIGGIF, BSB, CAD, CEOS, COASP, COSAR, CPG, CTG, DERIVED, DIMAP, DIPEx, DOQ1, DOQ2, ECRGTOC, EIR, ESAT, ESRIC, FAST, GFF, GRASSASCIIGrid, GSC, GXF, GenBin, IRIS, ISG, JAXAPALSAR, JDEM, L1B, LOSLAS, MAP, MSGN, NDF, NGSGEOID, NOAA_B, NSIDCbin, NWT_GRC, OZI, PDS, PRF, RIK, RPFTOC, RS2, SAFE, SAR_CEOS, SDTS, SENTINEL2, SNODAS, SRP, STACIT, STACTA, TGA, TIL, TSX

**Write Only** \
COG, PDF


### Vector
**Read & Write** \
CSV, DGN, DXF, ESRI Shapefile, FlatGeobuf, GML, GPKG, GPX, GeoJSON, GeoJSONSeq, GeoRSS, Geoconcept, JML, JSONFG, KML, MBTiles, MVT, MapInfo File, MapML, Memory, ODS, OGR_GMT, OpenFileGDB, PCIDSK, PDS4, PMTiles, S57, SQLite, Selafin, VDV, VICAR, WAsP, XLSX

**Read Only** \
AVCBin, AVCE00, CAD, EDIGEO, ESRIJSON, GTFS, Idrisi, LVBAG, OGR_PDS, OGR_SDTS, OGR_VRT, OSM, SVG, SXF, TIGER, TopoJSON, UK .NTF, VFK

**Write Only** \
PDF, PGDUMP

## Packages

| Package | Description |
| ------- | ----------- |
| `gdal3.js` | package contains only the WebAssembly output, eliminating the need for compilation. It is compatible with both browser and Node.js environments. |
| `@gdal3.js/prebuilt` | package includes precompiled libraries for Android, iOS, and WebAssembly. It is compatible with Browser, Node.js, and React Native environments. However, due to its dependencies, the download size is relatively large. If storage space and internet bandwidth are not a concern, this package is highly recommended for ease of use. |
| &nbsp; | &nbsp; |
| `@gdal3.js/app-web` | package is a web application that provides a user interface for using the gdal_translate, ogr2ogr, and gdal_rasterize tools online. It utilizes gdal3.js in the background to process files directly in the browser, ensuring all file conversions occur on the client side. <br /><br /> [https://gdal3.js.org](https://gdal3.js.org) |
| `@gdal3.js/app-mobile` | package is a mobile application that also provides a user interface for the gdal_translate, ogr2ogr, and gdal_rasterize tools. Similar to the web application, it uses gdal3.js in the background to handle file conversions entirely on the client side, running directly on mobile devices. |
