// ==UserScript==
// @name                Beta-Freedit L1+
// @namespace           https://greasyfork.org/users/10038-janek250
// @author              Janek250 & Martin Kolář
// @description         Vrstva míst úprav pro nováčky Freedit L1+
// @include             https://www.waze.com/editor/*
// @include             https://www.waze.com/*/editor/*
// @include             https://editor-beta.waze.com/*
// @version             0.6.1
// @grant               none
// ==/UserScript==
//--------------------------------------------------------------------------------------

FE_version = 'Alfa 0.6.1';

/* definice trvalých proměných */
  var FE_ctrlPressed = false;
  var FE_data = [];
  var FE_dataLoad = false;
  var FE_dataCount = 0;
  var FE_colors = ['#00BBFF', '#FFAE00', '#FFFF00', '#5E8F47', '#FF0000']; //HTML barvy modrá = #00BBFF oranžová = #FFAE00 žlutá = #FFFF00 zelená = #5E8F47 červená = #FF0000
  var FE_date = new Date();

  var FE_alertsDataMistakes = localStorage.getItem('FE_alertsDataMistakes');
  if (typeof FE_alertsDataMistakes != 'string') {
    FE_alertsDataMistakes = '';
  }
  FE_alertsDataMistakes = FE_alertsDataMistakes.split(',');

  var FE_alertsDataComplete = localStorage.getItem('FE_alertsDataComplete');
  if (typeof FE_alertsDataComplete != 'string') {
    FE_alertsDataComplete = '';
  }
  FE_alertsDataComplete = FE_alertsDataComplete.split(',');

  //  online/offline status
  var FE_status = localStorage.getItem('FE_status');
  if (FE_status === null) { //  default status
    FE_status = 'on';
  }

  var FE_linksSettings = {
    'add_new': '//freedit.local/addFreedit.php?name={name}&link={link}&region={region}&district={district}&added_by={added_by}',
    'register_freedit': '//freedit.local/giveMeEdit.php?editor={editor}&state=1',
    'send_freedit_to_control': '//freedit.local/giveMeEdit.php?editor={editor}&state=2&freedit={freedit}',
    'send_control_report': '//freedit.local/sendControlMessage.php?freedit={freedit}&editor={editor}'
  };

  //  language settings
  var FE_allowLanguage = ['cs_CZ', 'en_EN'];
  var FE_language = 'en_EN';  //  default language
  var FE_translation = [];

  //  cs translation
  FE_translation['cs_CZ'] = {
    'link': 'https://www.waze.com/cs/editor/?env=row&lon={lon}&lat={lat}&zoom={zoom}',
    'map_layer_state_0': 'Freedit: {id}\n{name} ({district})\nVložil: {added_by}\nTento Freedit je VOLNÝ \n zbývá: {days_left} dnů \n {attrs} viz záložka «',
    'map_layer_state_1': 'Freedit: {id}\n{name} ({district})\nVložil: {added_by}\nEdituje: {editor}\n zbývá: {days_left} dnů\n{attrs} viz záložka «',
    'map_layer_state_2': 'Freedit: {id}\n{name} ({district})\nVložil: {added_by}\neditoval: {editor}\n ke kontrole\n{attrs} viz záložka «',
    'map_layer_state_3': 'Freedit: {id}\n{name} ({district})\nVložil: {added_by}\neditoval: {editor}\n HOTOVO, děkujeme',
    'map_layer_state_4': 'Freedit: {id}\n{name} ({district})\nVložil: {added_by}\neditoval: {editor}\n CHYBA, více info Fórum/rozcestník.\n «« odkaz na záložce ««',
    'tab_add_new_freedit': 'Formulář pro zadání nového',
    'tab_freedit_table': 'Tabulka',
    'tab_graphs': 'Grafy',
    'tab_forum': 'Fórum',
    'tab_signpost': 'Rozcestník',
    'tab_form_for_register_editing': 'Formulář k přihlášení editování',
    'tab_control_form_l3': 'Formulář ke kontrole (L3+)',
    'tab_status_message': 'Status: <a href="#" id="freedit-switch-on-off">{state}</a> Načteno: {freedit_count} F',
    'tab_free_for_all': 'Volný pro L1-6',
    'tab_free_for_l1_2': 'Chci ho (L1-2)',
    'tab_hot_tips_headline': '<b>Horké tipy:</b> <font size="1">(vyprší za:)</font>',
    'tab_hot_tips_link': '<i>{deadline} dnů</i> <a href="{link}" class="freedit-link">Freedit {id}</a> {attrs} <a href="https://docs.google.com/forms/d/1fVT1LuYThOO8zvlsAyMtzNrUh1coDsz5muv--quIFAo/viewform?entry.1410492847={id}&entry.2040011150=1+-+P%C5%99ihl%C3%A1sit+se+k+editov%C3%A1n%C3%AD&entry.1719066620={user}" target="_blank">{for_users}</a>',
    'tab_editing_headline': '<br /><b>Edituje se:</b><br />',
    'tab_editing_link': '<a href="{link}" class="freedit-link">Freedit {id}</a></u> {editor}: {attrs}',
    'tab_editing_link_own': 'odevzdat',
    'tab_control_headline': '<br /><b>Ke kontrole:</b><br />',
    'tab_control_link': '<a href="{link}" class="freedit-link">Freedit {id}</a></u> {editor}: {attrs}',
    'tab_control_link_l3': 'kontrola L3+',
    'tab_mistake_headline': '<br /><b>Přepracovat:</b> <font size="1"><a href="https://www.waze.com/forum/viewtopic.php?f=274&amp;t=134151#p1065158&quot;" target="_blank">(více info Fórum/rozcestník)</a></font><br />',
    'tab_mistake_link': '<a href="{link}" class="freedit-link">Freedit {id}</a> {editor}: {attrs}',
    'alert_mistake_with_comment': 'Ahoj {editor}\n\nVe Freedit {id} byly po kontrole nalezeny chyby,\nnebo není ve stavu aby mohl být označený jako hotový!\n\nKomentář ke stavu Freeditu:\n\n{comment}\n\nPro více informací zazvoň v chatu na\nJanek250 / Grepa / d2-mac\n\nnebo koukni do rozcestníku\n(odkaz je na záložce Freedit).',
    'alert_mistake_without_comment': 'Ahoj {editor}\n\nVe Freedit {id} byly po kontrole nalezeny chyby,\nnebo není ve stavu aby mohl být označený jako hotový.\n\nPro více informací zazvoň v chatu na\nJanek250 / Grepa / d2-mac\n\nnebo koukni do rozcestníku\n(odkaz je na záložce Freedit).',
    'alert_complete_with_comment': 'Ahoj {editor}\n\nTebou dokončený Freedit {id} byl vyhodnocen jako hotový s komentářem:\n\n{comment}\n\nDÍKY!',
    'alert_complete_without_comment': 'Ahoj {editor}\n\nTebou dokončený Freedit {id} byl vyhodnocen jako hotový.\n\nDÍKY!',
    'tab_bottom_legend': '<font size="1">Legenda:<br />G - oprava geometrie<br />K - kreslit nové uličky / parkoviště<br />O - kontrola odbočení / jednosměrek<br />N - kontrola názvu ulic / obce<br />A - Areály</font>',
    'script_version': '<font size="1"><a href="https://www.waze.com/forum/viewtopic.php?f=22&t=136397" target="_blank">Script Freedit L1+ verze {version}</a></font>',
    'add_new_form_error': 'Formulář není kompletní! Vyplň všechny údaje!',
    'add_new_form_success': 'Nový freedit byl úspěšně zadán. Děkujeme!',
    'register_editing_error': 'Formulář není kompletní! Vyplň všechny údaje!',
    'register_editing_success': 'Úspěšně jsi se přihlásil k editování. Můžeš začít!',
    'freedit_to_control_error': 'Formulář není kompletní! Vyplň všechny údaje!',
    'freedit_to_control_success': 'Díky za opravení. V nejbližší době se na tvoje dílo podívá L3+ editor a upozorní tě na případné chyby.',
    'control_message_error': 'Formulář není kompletní! Vyplň všechny údaje!',
    'control_message_success': 'Díky za kontrolu!'
  };

  //  en translation
  FE_translation['en_EN'] = {

  };

  //Obdelník na ležato
  var FE_shape1x = [0.245760,0.122880,0.061440,0.030720,0.015360,0.007680,0.003840,0.001920,0.000960,0.000480,0.000240];
  var FE_shape1y = [0.088064,0.044032,0.022016,0.011008,0.005504,0.002752,0.001376,0.000688,0.000344,0.000172,0.000086];
  //Obdelní na stojato
  var FE_shape2x = [0.075562,0.037781,0.018890,0.009445,0.004723,0.002361,0.001181,0.000590,0.000295,0.000148,0.000074];
  var FE_shape2y = [0.088064,0.044032,0.022016,0.011008,0.005504,0.002752,0.001376,0.000688,0.000344,0.000172,0.000086];
  //Čtverec
  var FE_shape3x = [0.136272,0.068136,0.034068,0.017034,0.008517,0.004259,0.002129,0.001065,0.000532,0.000266,0.000133];
  var FE_shape3y = [0.088064,0.044032,0.022016,0.011008,0.005504,0.002752,0.001376,0.000688,0.000344,0.000172,0.000086];

  //  styles
  var FE_styles = '<style type="text/css">'
    + '#fe-modal-window-background { position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:99990; }'
    + '#fe-modal-window { position:fixed;width:900px;left:50%;margin-left:-450px;height:700px;top:50%;margin-top:-350px;z-index:99992;background:#ffffff;padding:20px; }'
    + '.fe-hot-tips {width:100%;height:125px;overflow-y:scroll;}'
    + '</style>';



if (FE_status == 'on') {
  console.log('WME Freedit: Start load data');

  $.get('//freedit.local/getData.php', function(data) {
    for (var i in data) {
      FE_data[data[i].id] = data[i];
    }

    FE_dataCount = FE_data.length;
    console.log('WME Freedit: End load data');
    FE_dataLoad = true;
  }, 'json');
}

//Ošetření service Greasymonkey
function freedit_bootstrap() {
  bGreasemonkeyServiceDefined = false;

  try {
    bGreasemonkeyServiceDefined = (typeof Components.interfaces.gmIGreasemonkeyService == 'object');
  }
  catch (err) {
    /* Ignore */
  }

  if (typeof unsafeWindow == 'undefined' || !bGreasemonkeyServiceDefined) {
    unsafeWindow  = (function (){
      dummyElem = document.createElement('p');
      dummyElem.setAttribute ('onclick', 'return window;');
      return dummyElem.onclick ();
    });
  }

  /* Začátek kódu */
  freedit_wait();
}

//definování funkce a vzhled polygonu
function AddRaidPolygon(raidLayer, groupPoints, groupColor, groupNumber) {
  mro_Map = unsafeWindow.Waze.map;
  mro_OL = unsafeWindow.OpenLayers;
  groupName = 'RaidGroup' + groupNumber;

  style = { //nastavení vzhledu polygonu
    strokeColor: groupColor,
    strokeOpacity: .7,      //pruhlednost čáry
    strokeWidth: 2,   //toušťka obvodové čáry
    fillColor: groupColor,
    fillOpacity: 0.10,    //průhlednost výplně
    label: groupNumber,
    labelOutlineColor: 'black',   //linka kolem textu
    labelOutlineWidth: 3,     //šířka linky
    fontSize: 14,
    fontColor: groupColor,
    fontOpacity: .85,
    fontWeight: 'bold'
  };

  attributes = {
    name: groupName,
    number: groupNumber
  };

  pnt= [];

  for (i = 0; i < groupPoints.length; i++){
    convPoint = new OpenLayers.Geometry.Point(groupPoints[i].lon,groupPoints[i].lat).transform(new OpenLayers.Projection('EPSG:4326'), mro_Map.getProjectionObject());
    pnt.push(convPoint);
  }

  ring = new mro_OL.Geometry.LinearRing(pnt);
  polygon = new mro_OL.Geometry.Polygon([ring]);
  feature = new mro_OL.Feature.Vector(polygon,attributes,style);
  raidLayer.addFeatures([feature]);
}

//funkce vycuc lon / lat / zoom z permalinku
function getQueryString(link, name) {
  pos = link.indexOf( name + '=' ) + name.length + 1;
  len = link.substr(pos).indexOf('&');
  if (-1 == len) len = link.substr(pos).length;
  return link.substr(pos,len);
}

//funkce MMR??
function CurrentRaidLocation(raid_mapLayer) {
  mro_Map = unsafeWindow.Waze.map;

  for(i = 0; i < raid_mapLayer.features.length; i++){
    raidMapCenter = mro_Map.getCenter();
    raidCenterPoint = new OpenLayers.Geometry.Point(raidMapCenter.lon,raidMapCenter.lat);
    raidCenterCheck = raid_mapLayer.features[i].geometry.components[0].containsPoint(raidCenterPoint);

    if (raidCenterCheck === true) {
      raidLocationLabel = 'Editorův ráj - ' + $('.WazeControlLocationInfo').text();

      setTimeout(function(){
        $('.WazeControlLocationInfo').text(raidLocationLabel);
      },200);
    }
  }
}

//funkce inicializace MMR??
function InitMapRaidOverlay() {
  mro_Map = unsafeWindow.Waze.map;
  mro_OL = unsafeWindow.OpenLayers;
  mro_mapLayers = mro_Map.getLayersBy('uniqueName','Freedit L1+');
  raid_mapLayer = new mro_OL.Layer.Vector('Freedit L1+', {
    displayInLayerSwitcher: true,
    uniqueName: 'Freedit L1+'
  });

  I18n.translations.en.layers.name['Freedit L1+'] = 'Freedit L1+';
  mro_Map.addLayer(raid_mapLayer);


  // ***
  // Načtení stavu vrstvy zobrazena/skryta
  //

  // defaultně je vrstva zapnutá
  var FE_visible = true;

  // načte poslední uložený stav zobrazení vrstvy z localstorage
  if (localStorage) {
    var options = JSON.parse(localStorage.getItem("FE_options"));

    FE_visible = options[0];
    console.log("WME Freedit: Options loaded.");
  }

 // uložení stavu zobrazení vrstvy při exitu WME
  saveOptions = function() {
    if (localStorage) {
      var options = [];

      FE_visible = raid_mapLayer.visibility;
      options[0] = FE_visible;

      localStorage.setItem("FE_options", JSON.stringify(options));
      console.log("WME Freedit: Options saved.");
    }
  }

  window.addEventListener("beforeunload", saveOptions, false);

  // zobrazení nebo skrytí vrstvy podle posledního uloženého stavu
  raid_mapLayer.setVisibility(FE_visible);

  for (var i in FE_data) {
    if (typeof FE_data[i] == 'object') {
      if (FE_data[i].shape.indexOf('1') !== -1) {
        zx = FE_shape1x;
        zy = FE_shape1y;
      }

      else if (FE_data[i].shape.indexOf('2') !== -1) {
        zx = FE_shape2x;
        zy = FE_shape2y;
      }

      else {
        zx = FE_shape3x;
        zy = FE_shape3y;
      }

      b1x = FE_data[i].lon - zx[FE_data[i].zoom];
      b1y = FE_data[i].lat + zy[FE_data[i].zoom];
      b2x = FE_data[i].lon + zx[FE_data[i].zoom];
      b3y = FE_data[i].lat - zy[FE_data[i].zoom];

      FE_shapeOptions = [{lon:b1x,lat:b1y},{lon:b2x,lat:b1y},{lon:b2x,lat:b3y},{lon:b1x,lat:b3y}];
      FE_info = '';
      optionsTranslation = {};

      switch(FE_data[i].state) {
        case 0:
          FE_info = fe_t('map_layer_state_0', {'id': FE_data[i].id, 'name': FE_data[i].name, 'district': FE_data[i].district, 'added_by': FE_data[i].added_by, 'days_left': FE_data[i].deadline, 'attrs': FE_data[i].attrs});
          break;
        case 1:
          FE_info = fe_t('map_layer_state_1', {'id': FE_data[i].id, 'name': FE_data[i].name, 'district': FE_data[i].district, 'added_by': FE_data[i].added_by, 'editor': FE_data[i].editor, 'days_left': FE_data[i].deadline, 'attrs': FE_data[i].attrs});
          break;
        case 2:
          FE_info = fe_t('map_layer_state_2', {'id': FE_data[i].id, 'name': FE_data[i].name, 'district': FE_data[i].district, 'added_by': FE_data[i].added_by, 'editor': FE_data[i].editor, 'attrs': FE_data[i].attrs});
          break;
        case 3:
          FE_info = fe_t('map_layer_state_3', {'id': FE_data[i].id, 'name': FE_data[i].name, 'district': FE_data[i].district, 'added_by': FE_data[i].added_by, 'editor': FE_data[i].editor});
          break;
        case 4:
          FE_info = fe_t('map_layer_state_4', {'id': FE_data[i].id, 'name': FE_data[i].name, 'district': FE_data[i].district, 'added_by': FE_data[i].added_by, 'editor': FE_data[i].editor});
          break;
      }

      AddRaidPolygon(raid_mapLayer, FE_shapeOptions, FE_colors[FE_data[i].state], FE_info);
    }
  }

  setTimeout(function(){CurrentRaidLocation(raid_mapLayer);},3000);
  mro_Map.events.register('moveend', Waze.map, function(){CurrentRaidLocation(raid_mapLayer);});
  mro_Map.events.register('zoomend', Waze.map, function(){CurrentRaidLocation(raid_mapLayer);});
}

//fce k záložce
function getElementsByClassName(classname, node) {
  if (!node) {
    node = document.getElementsByTagName('body')[0];
  }

  a = [];
  re = new RegExp('\\b' + classname + '\\b');
  els = node.getElementsByTagName('*');

  for (i = 0, j = els.length; i<j; i++) {
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

function returnWazeLink(lon, lat, zoom) {
  return fe_t('link', {'lon': lon, 'lat': lat, 'zoom': zoom});
}

function prepareLinkForSend(url) {
  do {
    url = url.replace('&', '%26');
  } while (url.indexOf('&') !== -1);

  return url;
}

function checkCtrlPress() {
  //  kontroluej, zda je zmacknuty ctrl

  $(window).keydown(function(event) {
    if (event.which == 17) {
      FE_ctrlPressed = true;
    }
  }).keyup(function(event) {
    if (event.which == 17) {
      FE_ctrlPressed = false;
    }
  });
}

function getUrlParameter(param, url) {
  sPageURL = url.substring(1);
  sURLVariables = sPageURL.split('&');

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] == param) {
      return sParameterName[1];
    }
  }
}

function fe_t(name, params) { //  function for translation
  if (typeof params === 'object') {
    returnString = FE_translation[FE_language][name];

    for (var i in params) {
      do {
        returnString = returnString.replace('{' + i + '}', params[i]);
      } while (returnString.indexOf('{' + i + '}') !== -1);
    }

    return returnString;
  }
  else {
    return FE_translation[FE_language][name];
  }
}

function fe_l(name, params) { //  function for links
  if (typeof params === 'object') {
    returnString = FE_linksSettings[name];

    for (var i in params) {
      do {
        returnString = returnString.replace('{' + i + '}', params[i]);
      } while (returnString.indexOf('{' + i + '}') !== -1);
    }

    return returnString;
  }
  else {
    return FE_linksSettings[FE_language][name];
  }
}

function freedit_make_tab() {
  FE_tipsHtml = '';
  FE_editingHtml = '';
  FE_forControllHtml = '';
  FE_mistakesHtml = '';
  FE_editlink = [];
  FE_onlineContent = '';

  tCon = '';  //  tabContent (obsah zalozky)
  tCon += '<div class="fe-tab-header">'
        + '<a href="#" id="freedit-add-new">' + fe_t('tab_add_new_freedit') + '</a><br />'
        + '<a href="https://docs.google.com/spreadsheets/d/1wywD5uYNmejO_t6Gufzu5tBW0SeVAFdr2KVdeSY1mWg/edit#gid=0" target="_blank">' + fe_t('tab_freedit_table') + '</a>'
        + ' / (' + fe_t('tab_graphs') + ') / '
        + '<a href="https://www.waze.com/forum/viewtopic.php?f=274&amp;t=134151#p1065158&quot;" target="_blank">' + fe_t('tab_forum') + '</a> <font size="1">(' + fe_t('tab_signpost') + ')</font><br />'
        + '<a href="#" id="freedit-register">' + fe_t('tab_form_for_register_editing') + '</a>';

  if (me.rank >= 2) {
    tCon += '<br /><br /><a href="https://docs.google.com/forms/d/1JveRTqlfQmpgvgZ_OrgZp1Twa-sXiQcBqlQ7n5NbKW0/viewform?entry.1436115270=3+-+Zkontrolov%C3%A1no,+bez+v%C3%BDhrad&entry.1536264100=' + me.userName + '" target="_blank">' + fe_t('tab_control_form_l3') + '</a>';
  }

  if (FE_status == 'on') {
    translationOptions = {'state': 'ONline', 'freedit_count': FE_dataCount};

    for (var i in FE_data) {
      switch(FE_data[i].state) {
        case 0:
          if (FE_data[i].deadline < 14 && FE_data[i].deadline) {
            FE_for_users = ((FE_data[i].deadline < 0) ? fe_t('tab_free_for_all') : fe_t('tab_free_for_l1_2'));
            FE_tipsHtml += fe_t('tab_hot_tips_link', {'deadline': FE_data[i].deadline, 'link': returnWazeLink(FE_data[i].lon, FE_data[i].lat, FE_data[i].zoom), 'id': FE_data[i].id, 'attrs': FE_data[i].attrs, 'user': me.userName, 'for_users': FE_for_users});
            FE_tipsHtml += '<br />';
          }

          break;

        case 1:
          FE_editingHtml += fe_t('tab_editing_link', {'link': returnWazeLink(FE_data[i].lon, FE_data[i].lat, FE_data[i].zoom), 'id': FE_data[i].id, 'editor': FE_data[i].editor, 'attrs': FE_data[i].attrs});
          FE_editingHtml += ((FE_data[i].editor == me.userName) ? ' <a href="#" class="freedit-to-control" data-freedit-id="' + FE_data[i].id + '">' + fe_t('tab_editing_link_own') + '</a>' : '');
          FE_editingHtml += '<br />';
          break;

        case 2:
          FE_forControllHtml += fe_t('tab_control_link', {'link': returnWazeLink(FE_data[i].lon, FE_data[i].lat, FE_data[i].zoom), 'id': FE_data[i].id, 'editor': FE_data[i].editor, 'attrs': FE_data[i].attrs});
          FE_forControllHtml += ((me.rank >= 2) ? ' <a href="#" class="freedit-control-message" data-freedit-id="' + FE_data[i].id + '">' + fe_t('tab_control_link_l3') + '</a>' : '');
          FE_forControllHtml += '<br />';
          break;

        case 3:
          if (FE_data[i].editor == me.userName && typeof FE_alertsDataComplete[FE_data[i].id] == 'undefined') {
            FE_alertsDataComplete[FE_data[i].id] = 1;
            localStorage.setItem('FE_alertsDataComplete', FE_alertsDataComplete.join(','));

            if (FE_data[i].comment != '') {
              alert(fe_t('alert_complete_with_comment', {'editor': me.userName, 'id': FE_data[i].id, 'comment': FE_data[i].comment}));
            }
            else {
              alert(fe_t('alert_complete_without_comment', {'editor': me.userName, 'id': FE_data[i].id}));
            }
          }
          break;

        case 4:
          FE_mistakesHtml += fe_t('tab_mistake_link', {'link': returnWazeLink(FE_data[i].lon, FE_data[i].lat, FE_data[i].zoom), 'id': FE_data[i].id, 'editor': FE_data[i].editor, 'attrs': FE_data[i].attrs});

          if (FE_data[i].editor == me.userName && FE_alertsDataMistakes[FE_data[i].id]*1 != FE_date.getHours()) {
            FE_alertsDataMistakes[FE_data[i].id] = FE_date.getHours();
            localStorage.setItem('FE_alertsDataMistakes', FE_alertsDataMistakes.join(','));

            if (FE_data[i].comment != '') {
              alert(fe_t('alert_mistake_with_comment', {'editor': me.userName, 'id': FE_data[i].id, 'comment': FE_data[i].comment}));
            }
            else {
              alert(fe_t('alert_mistake_without_comment', {'editor': me.userName, 'id': FE_data[i].id}));
            }
          }
          break;
      }
    }



    if (FE_tipsHtml != '') { //  pokud jsou nejake horke tipy, zobrazime
      FE_onlineContent += fe_t('tab_hot_tips_headline') + '<div class="fe-hot-tips">' + FE_tipsHtml + '</div>';
    }

    if (FE_editingHtml != '') { //  pokud se prave neco edituje, zobrazime to
      FE_onlineContent += fe_t('tab_editing_headline') + FE_editingHtml;
    }

    if (FE_forControllHtml != '') { //  pokud je neco ke kontrole, zobrazime to
      FE_onlineContent += fe_t('tab_control_headline') + FE_forControllHtml;
    }

    if (FE_mistakesHtml != '') { //  pokud jsou nekde nejake chyby, zobrazime to
      FE_onlineContent += fe_t('tab_mistake_headline') + FE_mistakesHtml;
    }
  }
  else {
    translationOptions = {'state': 'OFFline', 'freedit_count': FE_dataCount};
  }

  tCon += '<br /><br />' + fe_t('tab_status_message', translationOptions) + '<br /><br />' + FE_onlineContent + '<br /><br />';

  tCon += fe_t('tab_bottom_legend') + '<br />' + fe_t('script_version', {'version': FE_version});

  userTabs = getId('user-info');
  navTabs = getElementsByClassName('nav-tabs', userTabs)[0];
  tabContent = getElementsByClassName('tab-content', userTabs)[0];

  newtab = document.createElement('li');
  newtab.innerHTML = '<a href="#sidepanel-freedit" data-toggle="tab">Freedit</a>';
  navTabs.appendChild(newtab);

  addon = document.createElement('section');
  addon.innerHTML = tCon;
  addon.id = 'sidepanel-freedit';
  addon.className = 'tab-pane';
  tabContent.appendChild(addon);
}

function freedit_make_modal_window(content) {
  $('<div id="fe-modal-window-background" />').appendTo('body');
  $('<div id="fe-modal-window" />').appendTo('body');
  $('#fe-modal-window').html(content);

  $('.fe-close-modal-window').on('click', function(event) {
    event.preventDefault();
    freedit_close_modal_window();
  });
}

function freedit_close_modal_window() {
  $('#fe-modal-window-background').remove();
  $('#fe-modal-window').remove();
}

function freedit_add_new() {
  actualLon = getActualGpsLon();
  actualLat = getActualGpsLat();

  $.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + actualLat + ',' + actualLon, function(data) {
    cityEdit = '';
    countryEdit = '';
    countryEdit2 = '';  //  kraj

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

    $.get(fe_l('add_new', {'name': cityEdit, 'link': prepareLinkForSend(returnWazeLink(actualLon, actualLat, getActualZoom())), 'region': countryEdit, 'district': countryEdit2, 'added_by': me.userName}), function(data) {
      freedit_make_modal_window(data);
      $('#add-new-freedit').on('submit', function(event) {
        event.preventDefault();

        $.post($(this).attr('action'), $(this).serialize(), function(data) {
          if (data.error) {
            alert(fe_t('add_new_form_error'));
          }
          else {
            alert(fe_t('add_new_form_success'));
            freedit_close_modal_window();
          }
        }, 'json');
      })
    });
  }, 'json');
}

function freedit_register_editing($el) {
  $.get(fe_l('register_freedit', {'editor': me.userName}), function(data) {
    freedit_make_modal_window(data);
    $('#register-freedit').on('submit', function(event) {
      event.preventDefault();

      $.post($(this).attr('action'), $(this).serialize(), function(data) {
        if (data.error) {
          alert(fe_t('register_editing_error'));
        }
        else {
          alert(fe_t('register_editing_success'));
          freedit_close_modal_window();
        }
      }, 'json');
    })
  });
}

function freedit_send_to_control($el) {
  $.get(fe_l('send_freedit_to_control', {'editor': me.userName, 'freedit': $el.attr('data-freedit-id')}), function(data) {
    freedit_make_modal_window(data);
    $('#register-freedit').on('submit', function(event) {
      event.preventDefault();

      $.post($(this).attr('action'), $(this).serialize(), function(data) {
        if (data.error) {
          alert(fe_t('freedit_to_control_error'));
        }
        else {
          alert(fe_t('freedit_to_control_success'));
          freedit_close_modal_window();
        }
      }, 'json');
    })
  });
}

function freedit_control_message($el) {
  $.get(fe_l('send_control_report', {'editor': me.userName, 'freedit': $el.attr('data-freedit-id')}), function(data) {
    freedit_make_modal_window(data);
    $('#register-freedit').on('submit', function(event) {
      event.preventDefault();

      $.post($(this).attr('action'), $(this).serialize(), function(data) {
        if (data.error) {
          alert(fe_t('control_message_error'));
        }
        else {
          alert(fe_t('control_message_success'));
          freedit_close_modal_window();
        }
      }, 'json');
    })
  });
}

//fce záložka obsah
function freedit_init() {
  $(FE_styles).appendTo('head');
  freedit_make_tab();

  $('#freedit-add-new').on('click', function(event) {
    event.preventDefault();
    freedit_add_new();
  });

  $('#freedit-register').on('click', function(event) {
    event.preventDefault();
    freedit_register_editing();
  });

  $('.freedit-to-control').on('click', function(event) {
    event.preventDefault();
    freedit_send_to_control($(this));
  });

  $('.freedit-control-message').on('click', function(event) {
    event.preventDefault();
    freedit_control_message($(this));
  });

  $('.freedit-link').on('click', function(event) {
    if (!FE_ctrlPressed) { //  pokud pri kliknuti nedrzel control
      event.preventDefault();
      href = $(this).attr('href');

      xy = OpenLayers.Layer.SphericalMercator.forwardMercator(parseFloat(getUrlParameter('lon', href)), parseFloat(getUrlParameter('lat', href)));
      unsafeWindow.Waze.map.setCenter(xy);
      unsafeWindow.Waze.map.zoomTo(getUrlParameter('zoom', href));
    }
  });

  $('#freedit-switch-on-off').on('click', function(event) {
    event.preventDefault();
    if (FE_status == "on") {
      localStorage.setItem('FE_status', 'off');
    } else {
      localStorage.setItem('FE_status', 'on');
    }
    window.location.reload();
  });
}

//fce wait co volá freedit_init
function freedit_wait() {
  if (!window.Waze.map || typeof me == 'undefined' || typeof map == 'undefined' || typeof wazeLocation == 'undefined') {
    setTimeout(freedit_wait, 500);
  } else {
    hasStates = Waze.model.hasStates();

    if (FE_status == 'on') {
      feedit_after_load_data();
    }
    else {
      console.log('WME Freedit: Load data off');
      freedit_init();
    }
  }
}

function feedit_after_load_data() {
  if (FE_dataLoad) {
    console.log('WME Freedit: Start showing layer');

    if (jQuery.inArray(wazeLocation.locale, FE_allowLanguage) !== false) {  //  set same language as in editor
      FE_language = wazeLocation.locale;
    }

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