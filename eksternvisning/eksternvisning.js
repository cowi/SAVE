var SAVE = (function () {

})();


    var loggedin = false;
    var store, store2, ctrl, ctrl2,adresse,defaults;

    var searchPoint = {
      "lon":0,
      "lat":0
    }
    
    var attributes = {
      "adr_husnr_postnr" : "Adresse",
      "bygningsnummer": "Bygningsnummer",
      "bevaring" : "Bevaringsværdi",
      "bevaring_kommentar" : "Kommentar",
      "bygn_stilart" : "Stilart",
      "opfoerelsesaar" : "Opførelsesår",
      "date" : "Registreringsdato"
    };
    
    var styleMap = new OpenLayers.StyleMap({
      'default' : {},
      'temporary' : {},
      'select' : {
        pointRadius : 8,
        fillColor : "blue",
        fillOpacity : 0,
        strokeColor : "blue",
        strokeOpacity : 0.7
      }
    });

    var styleMap2 = new OpenLayers.StyleMap({
      'default' : {
        fillColor : 'blue',
        fillOpacity : 0,
        strokeColor : 'blue',
        strokeOpacity : 0.7
      },
      'temporary' : {},
      'select' : {
        fillColor : 'blue',
        fillOpacity : 0,
        strokeColor : 'blue',
        strokeOpacity : 0.7
      }
    });

    var config = {  
      db: "mobreg", 
      schema: "middelfart_save", 
      infotable: "middelfart_view_unique", 
      linkurl: "test", 
      zoomToStore : true,
      tileLayers :["middelfart_save.tforms115770112366019_join"],
      tileLayersLoggedIn :["middelfart_save.tforms115770112366019_join"],
      extent: [1069292.6004777, 7428392.5300405, 1128149.1122491, 7470432.8955915],
      komKode:410,
      bgLayers:[
        {"layer":"rudersdal_save.kms_skaermkort", "name":"kms","bg":true},
      ]
    };
    
    defaults = {
      el: "map",
      sql: "select * from " + config.schema + "." + config.infotable,
      tileLayers :[],
      tileLayersLoggedIn :[],
      zoomToStore : true,
      styleMap: styleMap,
      attributes: [],
      maxClickDist: 1000,
      komKode: [],
      bgLayers:[]
    };

    
    if (config) {
      for (var prop in config) {
        if (config.hasOwnProperty(prop)) {
          defaults[prop] = config[prop];
        }
      }
    }
    
    $(window).load(function() {
      cloud = new mygeocloud_ol.map(defaults.el, defaults.db);
      cloud.clickController = OpenLayers.Class(OpenLayers.Control, {
        defaultHandlerOptions : {
          'single' : true,
          'double' : false,
          'pixelTolerance' : 0,
          'stopSingle' : false,
          'stopDouble' : false
        },
        initialize : function(options) {
          this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
          OpenLayers.Control.prototype.initialize.apply(this, arguments);
          this.handler = new OpenLayers.Handler.Click(this, {
            'click' : this.trigger
          }, this.handlerOptions);
        },
        trigger : function(e) {

          $("#meta").show();

          var coords = cloud.map.getLonLatFromViewPortPx(e.xy);

          searchPoint.lon = coords.lon;
          searchPoint.lat = coords.lat;

          if (loggedin) {
            store.sql = "SELECT *,round(ST_Distance(transform(the_geom,900913), GeomFromText('POINT(" + coords.lon + " " + coords.lat + ")',900913))) as afstand FROM "+defaults.schema+"."+defaults.infotable+" ORDER BY afstand LIMIT 1";
          }
          else 
          {
            store.sql = "SELECT *,round(ST_Distance(transform(the_geom,900913), GeomFromText('POINT(" + coords.lon + " " + coords.lat + ")',900913))) as afstand FROM "+defaults.schema+"."+defaults.infotable+" ORDER BY afstand LIMIT 1";
          }

          store.reset()
          store.load()
          store.onLoad = function() {
            if(store.geoJSON.features[0].properties.afstand>defaults.maxClickDist)
            {
              alert("Advarsel: Ingen bygning er valgt. Der er "+store.geoJSON.features[0].properties.afstand+"m til nærmeste bygning. Du skal klikke højest "+defaults.maxClickDist+"m fra en bygning.");
            }
            else
            {
              ctrl.select(store.layer.features[0]);
            }
          }

        }
      });
      
      var click = new cloud.clickController();
      
      cloud.map.addControl(click);
      click.activate();
      cloud.zoomToExtent(defaults.extent, true);

      if (loggedin) {
        cloud.addTileLayers(defaults.tileLayersLoggedIn,{singleTile:true});
      }else{
        cloud.addTileLayers(defaults.tileLayers,{singleTile:true});
      }

      for(i=0;i<defaults.bgLayers.length;i++)
      {
        cloud.addTileLayers([defaults.bgLayers[i].layer],{isBaseLayer:defaults.bgLayers[i].bg,name:defaults.bgLayers[i].name});
      }
      
      cloud.addGoogleHybrid({type : google.maps.MapTypeId.HYBRID});   
      
      store = new mygeocloud_ol.geoJsonStore(defaults.db, {
        styleMap : defaults.styleMap
      });
      
      cloud.addGeoJsonStore(store);
      
      //Store til at vælge andre bygninger på samme ejendomsnummer
      store2 = new mygeocloud_ol.geoJsonStore(defaults.db, {
        styleMap : defaults.styleMap
      });
      cloud.addGeoJsonStore(store2);

      ctrl = cloud.addControl(
        new OpenLayers.Control.SelectFeature(store.layer, {
        hover : false,
        renderIntent : "select",
        onSelect : function(e) {
          $('#attr').empty();


          $('#attr').append($('#template').jqote(e));
          var content = $('#attr').html();
          var str = content.replace(/}@&amp;\+{/gi, ', '); //Sætning til at fjerne WH adskiller tegn
          $('#attr').html(str);
          $("#ekstra .content").html("<img src='http://beta.mygeocloud.cowi.webhouse.dk/apps/custom/save/ajax-loader.gif' />");

        
        
          if(loggedin)
          {
            store2.sql = "SELECT * FROM "+defaults.schema+"."+defaults.infotable+" WHERE ejendomsnummer='" + store.geoJSON.features[0].properties.ejendomsnummer +"' order by vejnavn,(CASE WHEN husnr < 'A' THEN lpad(husnr, 5, '0') ELSE husnr END),(CASE WHEN bygningsnummer < 'A' THEN lpad(bygningsnummer, 5, '0') ELSE bygningsnummer END)";
          }
          else{
            store2.sql = "SELECT * FROM "+defaults.schema+"."+defaults.infotable+" WHERE ejendomsnummer='" + store.geoJSON.features[0].properties.ejendomsnummer +"' order by vejnavn,(CASE WHEN husnr < 'A' THEN lpad(husnr, 5, '0') ELSE husnr END),(CASE WHEN bygningsnummer < 'A' THEN lpad(bygningsnummer, 5, '0') ELSE bygningsnummer END)";
          }
          
          store2.reset();
          store2.load();

          
        },
        onUnselect : function(feature) {
        }
      }));

      ctrl2 = cloud.addControl(
        new OpenLayers.Control.SelectFeature(store2.layer, {
        hover : false,
        renderIntent : "select",
        onSelect : function(e) {
          $('#attr').empty();
          $('#attr').append($('#template').jqote(e));
          var content = $('#attr').html();
          var str = content.replace(/}@&amp;\+{/gi, ', '); //Sætning til at fjerne WH adskiller tegn
          $('#attr').html(str);
          store.reset();
          cloud.zoomToPoint(e.geometry.x,e.geometry.y,18); 
        },
        onUnselect : function(feature) {
        }
      }));

      store.onLoad = function() {
      }
      
      store2.onLoad = function(){

        var html ="";
        store2_counter = 0;
        $.each(store2.geoJSON.features, function() 
          { 
          html += "<a style='font-size:8pt;' href='javascript:ctrl2.unselectAll();ctrl2.select(store2.layer.features["+store2_counter+"]);'>"+this.properties.vejnavn+" "+this.properties.husnr+", bygning "+this.properties.bygningsnummer+"</a><br/>";
          store2_counter++;
          }
        );
        $("#ekstra .content").empty();
        $("#ekstra .content").html(html);
      }

      $("#streetname").autocompleteAddress({
        kommunekode: defaults.komKode
      });
      $("#reset").bind("click", function() {
        $("input[type=text], textarea").val("");
      });
      $("#search").bind("click", search);

       }
    );
    
    function switchBaseLayer(name) {
      var base = cloud.map.getLayersByName(name)[0];
      base.setVisibility(true);
      cloud.map.setBaseLayer(base);
    }
    
    var search = function(){
      $.ajax({
        url: "http://geo.oiorest.dk/adresser.json",
        dataType: "jsonp",
        data: "postnr="+$("#zipcode").val()+"&kommunedkode="+defaults.komKode+"&vejnavn="+encodeURIComponent($("#streetname").val())+"&husnr="+$("#streetnumber").val(),
        success: function( data ) {
          $("#meta").show();
          if(data[0]!=undefined)
          {
            
            var doFlag = false;
            var p
            if(data[0].etrs89koordinat.oest == "0" || data[0].etrs89koordinat.nord == "0"){
              alert("Adressen kunne ikke placeres på kortet");
              cloud.zoomToExtent(defaults.komKode, true);
              }
            else {
              p = new OpenLayers.Geometry.Point(data[0].etrs89koordinat.oest,data[0].etrs89koordinat.nord);
              var tp = p.transform(new OpenLayers.Projection("EPSG:25832"),new OpenLayers.Projection("EPSG:900913"))
              searchPoint.lon=tp.x;
              searchPoint.lat=tp.y;
              cloud.zoomToPoint(p.x,p.y,18);
              doFlag=true;
              }
            
            if(doFlag){
              if(loggedin)
              {
                store.sql = "SELECT *,round(ST_Distance(transform(the_geom,900913), GeomFromText('POINT(" + p.x + " " + p.y + ")',900913))) as afstand FROM "+defaults.schema+"."+defaults.infotable+" ORDER BY afstand LIMIT 1";
              }else{
                store.sql = "SELECT *,round(ST_Distance(transform(the_geom,900913), GeomFromText('POINT(" + p.x + " " + p.y + ")',900913))) as afstand FROM "+defaults.schema+"."+defaults.infotable+" ORDER BY afstand LIMIT 1";
              }
              store.reset();
              store.load();
            }
            
            store.onLoad = function() {
              if(store.geoJSON.features[0].properties.afstand>defaults.maxClickDist)
              {
                alert("Advarsel: Ingen bygning er valgt. Der er "+store.geoJSON.features[0].properties.afstand+"m til nærmeste bygning. Du skal klikke højest "+defaults.maxClickDist+"m fra en bygning.");
              }else
              {
              ctrl.select(store.layer.features[0]);
              }
            }



          }
          else
          {
            alert("Adressen kunne ikke findes.");
          }
        }
      });

    }
