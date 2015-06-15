// ==UserScript==
// @name                Beta-Freedit L1+
// @namespace           https://greasyfork.org/users/10038-janek250
// @author              Janek250 & Martin Kolář
// @description         Vrstva míst úprav pro nováčky Freedit L1+
// @include             https://www.waze.com/editor/*
// @include             https://www.waze.com/*/editor/*
// @include             https://editor-beta.waze.com/*
// @version             izrael 0.5.4.1
// @grant               none
// ==/UserScript==
//--------------------------------------------------------------------------------------

FEverze = 'Beta izrael 0.5.4.1';

/* definice trvalých proměných */
  var ctrlPressed = false;
  var FEid = [];
  var FEnazev = [];
  var FEkraj = [];
  var FEokres = [];
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
  var ted = new Date();
  var akt = localStorage.getItem("FEakt");
  var onoff = localStorage.getItem("FEonoff"); if (onoff === null) { onoff = "on";}
  var FEdataLoad = false;
  var FEpro = "";
  var FEeditlink = [];
//Obdelník na ležato
  var zxl = [0.245760,0.122880,0.061440,0.030720,0.015360,0.007680,0.003840,0.001920,0.000960,0.000480,0.000240];
  var zyl = [0.088064,0.044032,0.022016,0.011008,0.005504,0.002752,0.001376,0.000688,0.000344,0.000172,0.000086];
//Obdelní na stojato
  var zxs = [0.075562,0.037781,0.018890,0.009445,0.004723,0.002361,0.001181,0.000590,0.000295,0.000148,0.000074];
  var zys = [0.088064,0.044032,0.022016,0.011008,0.005504,0.002752,0.001376,0.000688,0.000344,0.000172,0.000086];
//Čtverec
  var zxc = [0.136272,0.068136,0.034068,0.017034,0.008517,0.004259,0.002129,0.001065,0.000532,0.000266,0.000133];
  var zyc = [0.088064,0.044032,0.022016,0.011008,0.005504,0.002752,0.001376,0.000688,0.000344,0.000172,0.000086];



if (onoff == "on") {
  console.log('WME Freedit: Start load data');

  $.getJSON('https://spreadsheets.google.com/feeds/list/1wywD5uYNmejO_t6Gufzu5tBW0SeVAFdr2KVdeSY1mWg/od6/public/values?alt=json', function(data) {
    for (var i = 0; data.feed.entry[i].gsx$id.$t !== ""; i++) {
      FEid[i] = data.feed.entry[i].gsx$id.$t;
      FEnazev[i] = data.feed.entry[i].gsx$nazev.$t;
      FEkraj[i] = data.feed.entry[i].gsx$kraj.$t;
      FEokres[i] = data.feed.entry[i].gsx$okres.$t;
      FEvlozil[i] = data.feed.entry[i].gsx$vlozil.$t;
      FEeditor[i] = data.feed.entry[i].gsx$editor.$t;
      FEstav[i] = data.feed.entry[i].gsx$stav.$t;
      FEvyprsi[i] = data.feed.entry[i].gsx$vyprsi.$t;
      FEtvar[i] = data.feed.entry[i].gsx$tvar.$t;
      FElink[i] = data.feed.entry[i].gsx$permalink.$t;
      FEatributy[i] = data.feed.entry[i].gsx$atribut.$t;
      konec++;
    }

    console.log('WME Freedit: End load data');
    FEdataLoad = true;
  });
}

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
  freedit_wait();
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
      var raidLocationLabel = 'Editor\'s paradise - '/* + raid_mapLayer.features[i].attributes.number + ' - '*/ + $('.WazeControlLocationInfo').text();

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
    var href = FElink[i];
    var x = parseFloat(getQueryString(href, 'lon'));
    var y = parseFloat(getQueryString(href, 'lat'));
    var zoom = parseInt(getQueryString(href, 'zoom'));

    if(FEtvar[i].indexOf('1') !== -1) {zx = zxl; zy = zyl;}
    if(FEtvar[i].indexOf('2') !== -1) {zx = zxs; zy = zys;}
    if(FEtvar[i].indexOf('3') !== -1) {zx = zxc; zy = zyc;}
    var b1x = x - zx[zoom]; var b1y = y + zy[zoom]; var b2x = x + zx[zoom]; var b3y = y - zy[zoom];

    var Freedit01 = [{lon:b1x,lat:b1y},{lon:b2x,lat:b1y},{lon:b2x,lat:b3y},{lon:b1x,lat:b3y}];
    var FEinfo = '';
    if(FEstav[i] == 0) {FEinfo = '\n This freedit is free \n days left: ' + FEvyprsi[i] + '' + '\n' + FEatributy[i] + ' see bookmark «';}
    if(FEstav[i] == 1) {FEinfo = '\n edits by: ' + FEeditor[i] + '\n deys left: ' + FEvyprsi[i] + '' + '\n' + FEatributy[i] + ' see bookmark «';}
    if(FEstav[i] == 2) {FEinfo = '\n edited by: ' + FEeditor[i] + '\n to control' + '\n' + FEatributy[i] + ' see bookmark «';}
    if(FEstav[i] == 3) {FEinfo = '\n edited by: ' + FEeditor[i] + '\n COMPLETE! Thanks! ';}
    if(FEstav[i] == 4) {FEinfo = '\n edited by: ' + FEeditor[i] + '\n ERROR, more info Forum/signpost.\n «« link on bookmark ««';}

    AddRaidPolygon(raid_mapLayer, Freedit01, barva[FEstav[i]], FEid[i] + '\n' + FEnazev[i] + ' (' + FEokres[i] + ')\n added by: ' + FEvlozil[i] + FEinfo);
  }

  setTimeout(function(){CurrentRaidLocation(raid_mapLayer);},3000);
  mro_Map.events.register("moveend", Waze.map, function(){CurrentRaidLocation(raid_mapLayer);});
  mro_Map.events.register("zoomend", Waze.map, function(){CurrentRaidLocation(raid_mapLayer);});
}

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
  addon.innerHTML = '<b><u><a href="#" id="freedit-add-new">Form for new freedit</a></u></b>';
  addon.innerHTML += '<b><br><u><a href="https://docs.google.com/spreadsheets/d/1wywD5uYNmejO_t6Gufzu5tBW0SeVAFdr2KVdeSY1mWg/edit#gid=0" target="_blank">Table</a></u> / (Graphs) / ';
  addon.innerHTML += '<b><u><a href="https://www.waze.com/forum/viewtopic.php?f=274&amp;t=134151#p1065158&quot;" target="_blank">Forum</a></u></b>&nbsp;<i><font size="1">(Signpost)</font></i>';
  addon.innerHTML += '<br><b><u><a href="https://translate.google.com/translate?sl=cs&tl=en&js=y&prev=_t&hl=cs&ie=UTF-8&u=https%3A%2F%2Fdocs.google.com%2Fforms%2Fd%2F1fVT1LuYThOO8zvlsAyMtzNrUh1coDsz5muv--quIFAo%2Fviewform%3Fentry.1719066620%3D' + me.userName + '&edit-text=" target="_blank">Form to register editing</u></a></b>';

  if (me.rank >= 2) {
    addon.innerHTML += '<br><b><u><a href="https://translate.google.com/translate?sl=cs&tl=en&js=y&prev=_t&hl=cs&ie=UTF-8&u=https%3A%2F%2Fdocs.google.com%2Fforms%2Fd%2F1JveRTqlfQmpgvgZ_OrgZp1Twa-sXiQcBqlQ7n5NbKW0%2Fviewform%3Fentry.1436115270%3D3%2B-%2BZkontrolov%25C3%25A1no%2C%2Bbez%2Bv%25C3%25BDhrad%26entry.1536264100%3D' + me.userName + '&edit-text=" target="_blank">Form of control (L3+)</u></a></b>';
  }

  addon.innerHTML += '<br>';
  //addon.innerHTML += '<br><i><font size="1">(změnu stavu např. ke kontrole, zkontrolováno, atd..)</font></i><br>';

  if (onoff == "on") {
    addon.innerHTML += '<br>Status: <b><u><a href="#" id="freedit-switch-on-off">ONline</a></u></b> Load: <b>' + konec + '</b> F';
  } else {
    addon.innerHTML += '<br>Status: <b><u><a href="#" id="freedit-switch-on-off">OFFline</a></u></b> Load: <b>' + konec + '</b> F';
  }

  addon.innerHTML += '<br><br>';

  var tipsHtml = '';
  var editingHtml = '';
  var forControllHtml = '';
  var mistakesHtml = '';

  if (onoff == "on") {
    for (var h = 0; h < konec; h++) {
      if (FEvyprsi[h] < 21 && FEvyprsi[h] && FEstav[h] == 0) {  //  horke tipy
        if (FEvyprsi[h] < 0) { FEpro = "free for (L1-6)"; } else { FEpro = "I want it (L1-2)";}  // trošku prasáren neuškodí ;)
        if (FEeditor[h] === "") {
          tipsHtml += '<i>' + FEvyprsi[h] + 'days </i><u><a href="' + FElink[h] + '" class="freedit-link">Freedit ' + FEid[h] + '</a></u> ' + FEatributy[h] + ' &nbsp;<u><a href="https://translate.google.com/translate?sl=cs&tl=en&js=y&prev=_t&hl=cs&ie=UTF-8&u=https%3A%2F%2Fdocs.google.com%2Fforms%2Fd%2F1fVT1LuYThOO8zvlsAyMtzNrUh1coDsz5muv--quIFAo%2Fviewform%3Fentry.1410492847%3D' + FEid[h] + '%26entry.2040011150%3D1%2B-%2BP%25C5%2599ihl%25C3%25A1sit%2Bse%2Bk%2Beditov%25C3%25A1n%25C3%25AD%26entry.1719066620%3D' + me.userName + '" target="_blank">' + FEpro + '</a></u><br>';
        }
      }

      else if (FEstav[h] == 1) { //  prave se edituje
        if (FEeditor[h] == me.userName) {
          FEeditlink[h] = ' &nbsp;<u><a href="https://translate.google.com/translate?sl=cs&tl=en&js=y&prev=_t&hl=cs&ie=UTF-8&u=https%3A%2F%2Fdocs.google.com%2Fforms%2Fd%2F1fVT1LuYThOO8zvlsAyMtzNrUh1coDsz5muv--quIFAo%2Fviewform%3Fentry.1410492847%3D' + FEid[h] + '%26entry.2040011150%3D1%2B-%2BP%25C5%2599ihl%25C3%25A1sit%2Bse%2Bk%2Beditov%25C3%25A1n%25C3%25AD%26entry.1719066620%3D' + me.userName + '&edit-text=" target="_blank">consign</a></u>';
        } else {
          FEeditlink[h] = '';
        }

        editingHtml += '<u><a href="' + FElink[h] + '" class="freedit-link">Freedit ' + FEid[h] + '</a></u> ' + FEeditor[h]+ ' : ' + FEatributy[h] + FEeditlink[h] + '<br>';
      }

      else if (FEstav[h] == 2) { //  ke kontrole
        if (me.rank >= 2) {
          FEeditlink[h] = ' &nbsp;<u><a href="https://translate.google.com/translate?hl=cs&sl=cs&tl=en&u=https%3A%2F%2Fdocs.google.com%2Fforms%2Fd%2F1JveRTqlfQmpgvgZ_OrgZp1Twa-sXiQcBqlQ7n5NbKW0%2Fviewform%3Fentry.2124057902%3D' + FEid[h] + '%26entry.1436115270%3D3%2B-%2BZkontrolov%25C3%25A1no%2C%2Bbez%2Bv%25C3%25BDhrad%26entry.1536264100%3D' + me.userName + '" target="_blank">control L3+</a></u>';
        } else {
          FEeditlink[h] = '';
        }

        forControllHtml += '<u><a href="' + FElink[h] + '" class="freedit-link">Freedit ' + FEid[h] + '</a></u> ' + FEeditor[h]+ ' : ' + FEatributy[h] + FEeditlink[h] + '</u><br>';
      }

      else if (FEstav[h] == 4) { //  chyby
        mistakesHtml += '<u><a href="' + FElink[h] + '" class="freedit-link">Freedit ' + FEid[h] + '</a></u> ' + FEeditor[h]+ ' : ' + FEatributy[h] + '</u><br>';
        if (FEeditor[h] == me.userName) {
          if (akt != ted.getHours()) {
            localStorage.setItem("FEakt", ted.getHours());
            alert('Hi ' + FEeditor[h] + '\n\nIn Freedit ' + FEid[h] + ' were found errors,\nor is not in a condition to be marked as completed\n\nfor more information contact Janek250 / Grepa / d2-mac on chat\n\nor look to signpost.\n(link is on Frredit bookmark)');
          }
        }
      }
    }

    if (tipsHtml != '') { //  pokud jsou nejake horke tipy, zobrazime
      addon.innerHTML += '<b>Hot tips: </b><i><font size="1">(days left:)</font></i><br><div style="width:100%;height:125px;overflow-y:scroll;">' + tipsHtml + '</div>';
    }

    if (editingHtml != '') { //  pokud se prave neco edituje, zobrazime to
      addon.innerHTML += '<br><b>Editing: </b><i><font size="1"></font></i><br>' + editingHtml;
    }

    if (forControllHtml != '') { //  pokud je neco ke kontrole, zobrazime to
      addon.innerHTML += '<br><b>For control: </b><br>'  + forControllHtml;
    }

    if (mistakesHtml != '') { //  pokud jsou nekde nejake chyby, zobrazime to
      addon.innerHTML += '<br><b>rework: </b><i><font size="1"><a href="https://www.waze.com/forum/viewtopic.php?f=274&amp;t=134151#p1065158&quot;" target="_blank">(more information Forum/signpost)</a></font></i><br>' + mistakesHtml;
    }
  }

  addon.innerHTML += '<font size="1"><br>Legend: <i><a href="https://www.waze.com/forum/viewtopic.php?f=22&t=136397" target="_blank"> (Script Freedit L1+ version ' + FEverze + ')</a></i></font>';
  addon.innerHTML += '<font size="1"><br>G - geometry correction<br>K - draw new streets / parking lot<br>O - turn control / one-way<br>N - check street / city names<br>A - grounds</font>'; //vytvoří odkaz v tabu a připojí proměnnou

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
      var countryEdit2 = '';  //  kraj

      for (var i in data.results[1].address_components) {
        if (data.results[1].address_components[i].types[0] == 'locality' && data.results[1].address_components[i].types[1] == 'political') {
          cityEdit = data.results[1].address_components[i].long_name;
        }
        else if (data.results[1].address_components[i].types[0] == 'administrative_area_level_2' && data.results[1].address_components[i].types[1] == 'political') {
          countryEdit2 = data.results[1].address_components[i].long_name;
        }
        else if (data.results[1].address_components[i].types[0] == 'administrative_area_level_1' && data.results[1].address_components[i].types[1] == 'political') {
          countryEdit = data.results[1].address_components[i].long_name;
          break;
        }
      }

      window.open('https://translate.google.com/translate?sl=cs&tl=en&js=y&prev=_t&hl=cs&ie=UTF-8&u=https%3A%2F%2Fdocs.google.com%2Fforms%2Fd%2F1Xs8J_hfjtePXo9XhymZSfJ3hiFuwYGvtmS-470ibtIE%2Fviewform%3Fentry.1606798517%3D' + cityEdit + '%26entry.1257380691%3D' + countryEdit + '%26entry.1906822446%3D' + countryEdit2 + '%26entry.519781400%3D1%2B-%2BObdeln%25C3%25ADk%2Bna%2Ble%25C5%25BEato%2B%28v%25C3%25BD%25C5%2599ez%2Bz%2Bobrazovky%29%26entry.471479550%3DK%2B-%2Bkreslit%2Bnov%25C3%25A9%2Buli%25C4%258Dky%2B%2F%2Bparkovi%25C5%25A1t%25C4%259B%2B%2F%2Bare%25C3%25A1ly%26entry.1259126728%3Dhttps%3A%2F%2Fwww.waze.com%2Fcs%2Feditor%2F%3Fenv%3Drow%2526lon%3D' + actualLon + '%2526lat%3D' + actualLat + '%2526zoom%3D' + getActualZoom() + '%26entry.1757991414%3D' + me.userName + '&edit-text=', '_newtab');
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

  $('#freedit-switch-on-off').on('click', function(event) {
    event.preventDefault();
    if (onoff == "on") {
      localStorage.setItem("FEonoff", 'off');
    } else {
      localStorage.setItem("FEonoff", 'on');
    }
    window.location.reload();
  });
}

//fce wait co volá freedit_init
function freedit_wait() {
  if (!window.Waze.map || typeof me == 'undefined' || typeof map == 'undefined') {
    setTimeout(freedit_wait, 500);
  } else {
    hasStates = Waze.model.hasStates();

    if (onoff == "on") {
      feedit_after_load_data();
    }
    else {
      console.log('WME Freedit: Load data off');
      freedit_init();
    }
  }
}

function feedit_after_load_data() {
  if (FEdataLoad) {
    console.log('WME Freedit: Start showing layer');
    freedit_init();
    InitMapRaidOverlay();
  }
  else {
    setTimeout(feedit_after_load_data, 500);
  }
}

//volání fce a samotný script
freedit_bootstrap();

/*--------------------------------------------------------------------------------------
poznámky pod čarou :D

*/