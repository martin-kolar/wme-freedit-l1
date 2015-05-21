// ==UserScript==
// @name                Freedit L1+
// @namespace           https://greasyfork.org/users/10038-janek250
// @author              Janek250
// @description         Vrstva míst úprav pro nováčky Freedit L1+
// @include             https://www.waze.com/editor/*
// @include             https://www.waze.com/*/editor/*
// @include             https://editor-beta.waze.com/*
// @grant               GM_getValue
// @grant               GM_setValue
// @version             0.4.7
// @grant               none
// ==/UserScript==

// Kopie originálního skriptu davielde/rickzabel https://greasyfork.org/cs/scripts/8443-wme-mega-mapraid-overlay
// Skript vznikal na základě Grepovy myšlenky a velikého přispění spolutvůrců Petinka1 a d2-mac, za což moc děkuji.
// Novikny ve verzi : ošestření počtu HotFreeditů
//--------------------------------------------------------------------------------------

fe_verze = '0.4.7';

/* definice trvalých proměných */
  var ctrlPressed = false;
  var FEid = [];
  var FEnazev = [];
  var FEkraj = [];
  var FEvlozil = [];
  var FEeditor = [];
  var FEstav = [];
  var FEvyprsi = [];
  var FEatributy = [];
  var FEtvar = [];
  var FElink = [];
  var konec = 0;
  var barva = ["#00BBFF","#FFAE00","#FFFF00","#5E8F47","#FF0000"]; //HTML barvy modrá = #00BBFF oranžová = #FFAE00 žlutá = #FFFF00 zelená = #5E8F47 červená = #FF0000
  var zx = [];
  var zy = [];
//Obdelník na ležato
  var zxl = [0.245760,0.122880,0.061440,0.030720,0.015360,0.007680,0.003840,0.001920,0.000960,0.000480,0.000240];
  var zyl = [0.088064,0.044032,0.022016,0.011008,0.005504,0.002752,0.001376,0.000688,0.000344,0.000172,0.000086];
//Obdelní na stojato
  var zxs = [0.075562,0.037781,0.018890,0.009445,0.004723,0.002361,0.001181,0.000590,0.000295,0.000148,0.000074];
  var zys = [0.088064,0.044032,0.022016,0.011008,0.005504,0.002752,0.001376,0.000688,0.000344,0.000172,0.000086];
//Čtverec
  var zxc = [0.136272,0.068136,0.034068,0.017034,0.008517,0.004259,0.002129,0.001065,0.000532,0.000266,0.000133];
  var zyc = [0.088064,0.044032,0.022016,0.011008,0.005504,0.002752,0.001376,0.000688,0.000344,0.000172,0.000086];


//Ošetření service Greasymonkey
function freedit_bootstrap() {
  var bGreasemonkeyServiceDefined = false;

  try {
    bGreasemonkeyServiceDefined = (typeof Components.interfaces.gmIGreasemonkeyService == 'object');
  }
  catch (err) {
    /* Ignore */
  }

  if (typeof unsafeWindow == 'undefined' || !bGreasemonkeyServiceDefined) {
    unsafeWindow  = (function (){
      var dummyElem = document.createElement('p');
      dummyElem.setAttribute ('onclick', 'return window;');
      return dummyElem.onclick ();
    });
  }

  /* Začátek kódu */
  setTimeout(InitMapRaidOverlay, 2200);
  setTimeout(freedit_wait, 2000);
}

//definování funkce a vzhled polygonu
function AddRaidPolygon(raidLayer,groupPoints,groupColor,groupNumber) {
  var mro_Map = unsafeWindow.Waze.map;
  var mro_OL = unsafeWindow.OpenLayers;
  var raidGroupLabel = 'Freedit ' + groupNumber;
  var groupName = 'RaidGroup' + groupNumber;

  var style = { //nastavení vzhledu polygonu
    strokeColor: groupColor,
    strokeOpacity: .7,      //pruhlednost čáry
    strokeWidth: 2,   //toušťka obvodové čáry
    fillColor: groupColor,
    fillOpacity: 0.10,    //průhlednost výplně
    label: raidGroupLabel,
    labelOutlineColor: "black",   //linka kolem textu
    labelOutlineWidth: 3,     //šířka linky
    fontSize: 14,
    fontColor: groupColor,
    fontOpacity: .85,
    fontWeight: "bold"
  };

  var attributes = {
    name: groupName,
    number: groupNumber
  };

  var pnt= [];

  for(i = 0; i < groupPoints.length; i++){
    convPoint = new OpenLayers.Geometry.Point(groupPoints[i].lon,groupPoints[i].lat).transform(new OpenLayers.Projection("EPSG:4326"), mro_Map.getProjectionObject());
    //console.log('MapRaid: ' + JSON.stringify(groupPoints[i]) + ', ' + groupPoints[i].lon + ', ' + groupPoints[i].lat);
    pnt.push(convPoint);
  }

  var ring = new mro_OL.Geometry.LinearRing(pnt);
  var polygon = new mro_OL.Geometry.Polygon([ring]);
  var feature = new mro_OL.Feature.Vector(polygon,attributes,style);
  raidLayer.addFeatures([feature]);
}

//funkce vycuc lon / lat / zoom z permalinku
function getQueryString(link, name) {
    var pos = link.indexOf( name + '=' ) + name.length + 1;
    var len = link.substr(pos).indexOf('&');
    if (-1 == len) len = link.substr(pos).length;
    return link.substr(pos,len);
}

//funkce MMR??
function CurrentRaidLocation(raid_mapLayer) {
  var mro_Map = unsafeWindow.Waze.map;

  for(i = 0; i < raid_mapLayer.features.length; i++){
    var raidMapCenter = mro_Map.getCenter();
    var raidCenterPoint = new OpenLayers.Geometry.Point(raidMapCenter.lon,raidMapCenter.lat);
    var raidCenterCheck = raid_mapLayer.features[i].geometry.components[0].containsPoint(raidCenterPoint);
    //console.log('MapRaid: ' + raid_mapLayer.features[i].attributes.number + ': ' + raidCenterCheck);

    if (raidCenterCheck === true) {
      var raidLocationLabel = 'Editorův ráj - '/* + raid_mapLayer.features[i].attributes.number + ' - '*/ + $('.WazeControlLocationInfo').text();

      setTimeout(function(){
        $('.WazeControlLocationInfo').text(raidLocationLabel);
      },200);
    }
  }
}

//funkce inicializace MMR??
function InitMapRaidOverlay() {
  var mro_Map = unsafeWindow.Waze.map;
  var mro_OL = unsafeWindow.OpenLayers;
  var mro_mapLayers = mro_Map.getLayersBy("uniqueName","Freedit L1+");
  var raid_mapLayer = new mro_OL.Layer.Vector("Freedit L1+", {
    displayInLayerSwitcher: true,
    uniqueName: "Freedit L1+"
  });

  I18n.translations.en.layers.name["Freedit L1+"] = "Freedit L1+";
  mro_Map.addLayer(raid_mapLayer);
  raid_mapLayer.setVisibility(true);

  for (var i = 0; i < konec; i++) {
    var href = FElink[i];     //kde link je údaj z tabulky ve sloupci permalink
    var x = parseFloat(getQueryString(href, 'lon'));
    var y = parseFloat(getQueryString(href, 'lat'));
    var zoom = parseInt(getQueryString(href, 'zoom'));

    if(FEtvar[i].indexOf('1') !== -1) {zx = zxl; zy = zyl;}
    if(FEtvar[i].indexOf('2') !== -1) {zx = zxs; zy = zys;}
    if(FEtvar[i].indexOf('3') !== -1) {zx = zxc; zy = zyc;}
    var b1x = x - zx[zoom]; var b1y = y + zy[zoom]; var b2x = x + zx[zoom]; var b3y = y - zy[zoom];

    var Freedit01 = [{lon:b1x,lat:b1y},{lon:b2x,lat:b1y},{lon:b2x,lat:b3y},{lon:b1x,lat:b3y}];
    //aktuality - pokud je editor vypiš jmeno, pokud není tady muze byt tvoje jmeno
    // pokud stav 0 ( tady muze byt tvoje jmeno) 1 jmeno editora 2 jmeno editora a 'ke kontrole' 3 hotovo (editoval) 4 editor + chyba čti forum/rozcestník
    //if(FEeditor[i] !== "") {} else { FEeditor[i] = ' tady může být tvoje jméno ';}
    var FEinfo = '';
    if(FEstav[i] == 0) {FEinfo = '\n Tento Freedit je VOLNÝ \n zbývá : ' + FEvyprsi[i] + ' dnů' + '\n' + FEatributy[i] + ' viz záložka «';}
    if(FEstav[i] == 1) {FEinfo = '\n edituje : ' + FEeditor[i] + '\n zbývá : ' + FEvyprsi[i] + ' dnů' + '\n' + FEatributy[i] + ' viz záložka «';}
    if(FEstav[i] == 2) {FEinfo = '\n editoval : ' + FEeditor[i] + '\n ke kontrole' + '\n' + FEatributy[i] + ' viz záložka «';}
    if(FEstav[i] == 3) {FEinfo = '\n editoval : ' + FEeditor[i] + '\n HOTOVO, děkujeme ';}
    if(FEstav[i] == 4) {FEinfo = '\n editoval : ' + FEeditor[i] + '\n CHYBA, více info Fórum/rozcestník.\n «« odkaz na záložce ««';}

    AddRaidPolygon(raid_mapLayer, Freedit01, barva[FEstav[i]], FEid[i] + '\n' + FEnazev[i] + '\n vložil : ' + FEvlozil[i] + FEinfo);
  }

  setTimeout(function(){CurrentRaidLocation(raid_mapLayer);},3000);
  mro_Map.events.register("moveend", Waze.map, function(){CurrentRaidLocation(raid_mapLayer);});
  mro_Map.events.register("zoomend", Waze.map, function(){CurrentRaidLocation(raid_mapLayer);});
}

$.getJSON('https://spreadsheets.google.com/feeds/list/1wywD5uYNmejO_t6Gufzu5tBW0SeVAFdr2KVdeSY1mWg/od6/public/values?alt=json', function(data) {
  for (var i = 0; data.feed.entry[i].gsx$id.$t !== ""; i++) {
    FEid[i] = data.feed.entry[i].gsx$id.$t;
    FEnazev[i] = data.feed.entry[i].gsx$nazev.$t;
    FEkraj[i] = data.feed.entry[i].gsx$kraj.$t;
    FEvlozil[i] = data.feed.entry[i].gsx$vlozil.$t;
    FEeditor[i] = data.feed.entry[i].gsx$editor.$t;
    FEstav[i] = data.feed.entry[i].gsx$stav.$t;
    FEvyprsi[i] = data.feed.entry[i].gsx$vyprsi.$t;
    FEtvar[i] = data.feed.entry[i].gsx$tvar.$t;
    FElink[i] = data.feed.entry[i].gsx$permalink.$t;
    FEatributy[i] = data.feed.entry[i].gsx$atribut.$t;
    konec++;
  }
});

//fce k záložce
function getElementsByClassName(classname, node) {
  if(!node) {
    node = document.getElementsByTagName("body")[0];
  }

  var a = [];
  var re = new RegExp('\\b' + classname + '\\b');
  var els = node.getElementsByTagName("*");

  for (var i = 0, j = els.length; i<j; i++) {
    if (re.test(els[i].className)) {
       a.push(els[i]);
     }
  }

  return a;
}

//fce obsah záložky
function getId(node) {
  return document.getElementById(node);
}

function getActualGpsLon() {
  return getQueryString($('.WazeControlPermalink a').attr('href'), 'lon');
}

function getActualGpsLat() {
  return getQueryString($('.WazeControlPermalink a').attr('href'), 'lat');
}

function getActualZoom() {
  return parseInt(getQueryString($('.WazeControlPermalink a').attr('href'), 'zoom'));
}

function checkCtrlPress() {
  //  kontroluej, zda je zmacknuty ctrl

  $(window).keydown(function(event) {
    if (event.which == 17) {
      ctrlPressed = true;
    }
  }).keyup(function(event) {
    if (event.which == 17) {
      ctrlPressed = false;
    }
  });
}

function getUrlParameter(param, url) {
  var sPageURL = url.substring(1);
  var sURLVariables = sPageURL.split('&');

  for (var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] == param) {
      return sParameterName[1];
    }
  }
}

//fce záložka obsah
function freedit_init() {
  var addon = document.createElement('section');
  //addon.id = "freedit-addon";

  //zavolat permalink
  var href = $('.WazeControlPermalink a').attr('href');

  var lon = parseFloat(getQueryString(href, 'lon'));
  var lat = parseFloat(getQueryString(href, 'lat'));
  var zoom = parseInt(getQueryString(href, 'zoom'));

  // mezera  &nbsp; /nové okno  target="_blank" /
  addon.innerHTML = '<b><u><a href="#" id="freedit-add-new">Formulář pro zadání nového</a></u></b>';
  // addon.innerHTML += '<br><b><u><a href="https://docs.google.com/forms/d/1Xs8J_hfjtePXo9XhymZSfJ3hiFuwYGvtmS-470ibtIE/viewform" target="_blank">Formulář pro zadání nového</a></u></b>';
  addon.innerHTML += '<br><u><a href="https://docs.google.com/spreadsheets/d/1wywD5uYNmejO_t6Gufzu5tBW0SeVAFdr2KVdeSY1mWg/edit#gid=0" target="_blank">Tabulka</a></u></b>&nbsp<i><font size="1">(online přehled a seznam)</font></i>';
  addon.innerHTML += '<br><u><a href="https://www.waze.com/forum/viewtopic.php?f=274&amp;t=134151#p1065158&quot;" target="_blank">Fórum</a></u>&nbsp;<i><font size="1">(Rozcestník / chat místnost)</font></i>';
  addon.innerHTML += '<br><b><u><a href="https://docs.google.com/forms/d/1fVT1LuYThOO8zvlsAyMtzNrUh1coDsz5muv--quIFAo/viewform" target="_blank">Formulář k přihlášení editování</u></a></b></br><i><font size="1">(změnu stavu např. ke kontrole, zkontrolováno, atd..)</font></i>';
  addon.innerHTML += '<br><br>';

  var tipsHtml = '';
  var editingHtml = '';
  var forControllHtml = '';
  var mistakesHtml = '';
  var hf = [0,0,0,0];
  var maxShow = 7;

  for (var h = 0; h < konec; h++) {
    if (FEvyprsi[h] < 21 && FEvyprsi[h] > 0 && hf[0] < maxShow) {  //  horke tipy
      if (FEeditor[h] === "") {
        tipsHtml += '<i>' + FEvyprsi[h] + 'dnů </i><u><a href="' + FElink[h] + '" class="freedit-link">Freedit ' + FEid[h] + '</a></u> ' + FEatributy[h] + ' &nbsp;<u><a href="https://docs.google.com/forms/d/1fVT1LuYThOO8zvlsAyMtzNrUh1coDsz5muv--quIFAo/viewform?entry.1410492847=' + FEid[h] + ' ' + FEnazev[h] + '&entry.1719066620" target="_blank">chci ho</a></u><br>';
        hf[0]++;
      }
    }

    else if (FEstav[h] == "1" && hf[1] < maxShow) { //  prave se edituje
      editingHtml += '<u><a href="' + FElink[h] + '" class="freedit-link">Freedit ' + FEid[h] + '</a></u> ' + FEeditor[h]+ ' : ' + FEatributy[h] + '</u><br>';
      hf[1]++;
    }

    else if (FEstav[h] == "2" && hf[2] < maxShow) { //  ke kontrole
      forControllHtml += '<u><a href="' + FElink[h] + '" class="freedit-link">Freedit ' + FEid[h] + '</a></u> ' + FEeditor[h]+ ' : ' + FEatributy[h] + '</u><br>';
      hf[2]++;
    }

    else if (FEstav[h] == "4" && hf[3] < maxShow) { //  chyby
      mistakesHtml += '<u><a href="' + FElink[h] + '" class="freedit-link">Freedit ' + FEid[h] + '</a></u> ' + FEeditor[h]+ ' : ' + FEatributy[h] + '</u><br>';
      hf[3]++;
    }
  }

  if (tipsHtml != '') { //  pokud jsou nejake horke tipy, zobrazime
    addon.innerHTML += '<b>Horké tipy: </b><i><font size="1">(vyprší za:)</font></i><br>' + tipsHtml;
  }

  if (editingHtml != '') { //  pokud se prave neco edituje, zobrazime to
    addon.innerHTML += '<br><b>Edituje se: </b><i><font size="1"></font></i><br>' + editingHtml;
  }

  if (forControllHtml != '') { //  pokud je neco ke kontrole, zobrazime to
    addon.innerHTML += '<br><b>Ke kontrlole: </b><i><font size="1"><a href="https://docs.google.com/forms/d/1fVT1LuYThOO8zvlsAyMtzNrUh1coDsz5muv--quIFAo/viewform" target="_blank">(použij formulář)</u></a></font></i><br>' + forControllHtml;
  }

  if (mistakesHtml != '') { //  pokud jsou nekde nejake chyby, zobrazime to
    addon.innerHTML += '<br><b>Chyby: </b><i><font size="1"><a href="https://www.waze.com/forum/viewtopic.php?f=274&amp;t=134151#p1065158&quot;" target="_blank">(více info Fórum/rozcestník)</a></font></i><br>' + mistakesHtml;
  }

  addon.innerHTML += '<font size="1"><br>Celkový počet načtených Freeditů : </b>' + konec + '</i></font>';
  addon.innerHTML += '<font size="1"><br>Legenda: <i><a href="https://www.waze.com/forum/viewtopic.php?f=22&t=136397" target="_blank"> (Script Freedit L1+ verze ' + fe_verze + ')</a></i></font>';
  addon.innerHTML += '<font size="1"><br>G - oprava geometrie <br> K - kreslit nové uličky / parkoviště / areály <br> O - kontrola odbočení / jednosměrek <br> N - kontrola názvu ulic / obce</font>'; //vytvoří odkaz v tabu a připojí proměnnou

  var userTabs = getId('user-info');
  var navTabs = getElementsByClassName('nav-tabs', userTabs)[0];
  var tabContent = getElementsByClassName('tab-content', userTabs)[0];

  newtab = document.createElement('li');
  newtab.innerHTML = '<a href="#sidepanel-freedit" data-toggle="tab">Freedit</a>';
  navTabs.appendChild(newtab);

  addon.id = "sidepanel-freedit";
  addon.className = "tab-pane";
  tabContent.appendChild(addon);

  $('#freedit-add-new').on('click', function(event) {
    $el = $(this);

    event.preventDefault();
    var actualLon = getActualGpsLon();
    var actualLat = getActualGpsLat();

    $.getJSON('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + actualLat + ',' + actualLon, function(data) {
      var cityEdit = '';
      var countryEdit = '';

      for (var i in data.results[0].address_components) {
        if (data.results[0].address_components[i].types[0] == 'locality' && data.results[0].address_components[i].types[1] == 'political') {
          cityEdit = data.results[0].address_components[i].long_name;
        }
        else if (data.results[0].address_components[i].types[0] == 'administrative_area_level_1' && data.results[0].address_components[i].types[1] == 'political') {
          countryEdit = data.results[0].address_components[i].long_name;
          break;
        }
      }

      window.open('https://docs.google.com/forms/d/1Xs8J_hfjtePXo9XhymZSfJ3hiFuwYGvtmS-470ibtIE/viewform?entry.1606798517=' + cityEdit + '&entry.1257380691=' + countryEdit + '&entry.1259126728=https://www.waze.com/cs/editor/?env=row%26lon=' + actualLon + '%26lat=' + actualLat + '%26zoom=' + getActualZoom() + '&entry.1757991414=' + me.userName);
    });
  });

  $('.freedit-link').on('click', function(event) {
    if (!ctrlPressed) { //  pokud pri kliknuti nedrzel control
      event.preventDefault();
      href = $(this).attr('href');

      xy = OpenLayers.Layer.SphericalMercator.forwardMercator(parseFloat(getUrlParameter('lon', href)), parseFloat(getUrlParameter('lat', href)));
      unsafeWindow.Waze.map.setCenter(xy);
      unsafeWindow.Waze.map.zoomTo(getUrlParameter('zoom', href));
    }
  });
}

//fce wait co volá freedit_init
function freedit_wait() {
  if (typeof Waze.model.countries.objects == 'undefined' || Object.keys(Waze.model.countries.objects).length == 0) {
    setTimeout(freedit_wait, 500);
  } else {
    hasStates = Waze.model.hasStates();
    freedit_init();
  }
}

//volání fce a samotný script
freedit_bootstrap();

/*--------------------------------------------------------------------------------------
poznámky pod čarou :D

*/