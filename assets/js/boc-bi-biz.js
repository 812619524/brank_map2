// Static Params
var mNo = "tyyh";
var layerGroup = new L.LayerGroup();
var bMarkers = [];
var pMarkers = [];
var cData = { source: [] };
var heat;

var achievement = { "name": "业绩", "l1": "存款金额", "l2": "贷款金额", "l3": "新增客户"}; 
var subject = { "name": "主体", "l1": "个体户", "l2": "一般企业", "l3": "高新企业"}; 
var population = { "name": "人口", "l1": "常住人口", "l2": "我行客户"}; 
var support = { "name": "配套", "l1": "产业园", "l2": "地铁站", "l3": "公交站", "l4": "过境口岸", "l5": "火车站", "l6": "机场", "l7": "购物中心", "l8": "商业街", "l9": "学校", "l10": "政府单位", "l11": "住宅小区", "l12": "综合医院", "l13": "大型超市", "l14": "电信营业厅", "l15": "咖啡厅", "l16": "商务办公楼"}; 
var competition = {"name": "竞争", "l1": "同业网点", "l2": "自助银行"};

/**
 * Build Banks
 */
function mBanks(){
	
  $('#qBank').empty();
  $('#aBank').empty();
  
  var i = 0;
  for(var group in zgyh) {
      $('#qBank').append("<optgroup id='qOptgroup_"+i+"' label='"+group+"'></optgroup>");
      $('#aBank').append("<optgroup id='aOptgroup_"+i+"' label='"+group+"'></optgroup>");
	  for(var j = 0; j < zgyh[group].length; j++) {
		 $("optgroup#qOptgroup_"+i).append("<option value="+zgyh[group][j].position.lat+","+zgyh[group][j].position.lng+">"+zgyh[group][j].name+"</option>");
         $("optgroup#aOptgroup_"+i).append("<option value='"+group+","+zgyh[group][j].name+"'>"+zgyh[group][j].name+"</option>");
	  }
	  i++;
  } 
  
  $('#aBank').selectpicker('val', '22.541189,114.116414').trigger("change");
  $('#qBank').selectpicker("refresh");
  
  $('#aBank').selectpicker('val', ['深圳市分行,深圳市分行','深圳市分行,国贸支行','深圳市分行,万象支行']).trigger("change");
  $('#aBank').selectpicker("refresh");
}

/**
 * Build Labels
 */
function mLabels() {
	
  $('#aLabel').empty(); 
  
  var i = 0;
  for (var group in zgyh['深圳市分行'][0].label) {
	  
	   if(group === 'achievement') {
		  $('#aLabel').append("<optgroup id='lOptgroup_"+i+"' label='"+achievement.name+"'></optgroup>");
	   } else if(group === 'subject'){
		  $('#aLabel').append("<optgroup id='lOptgroup_"+i+"' label='"+subject.name+"'></optgroup>");
	   } else if(group === 'population'){
		  $('#aLabel').append("<optgroup id='lOptgroup_"+i+"' label='"+population.name+"'></optgroup>");
	   } else if(group === 'support'){
		  $('#aLabel').append("<optgroup id='lOptgroup_"+i+"' label='"+support.name+"'></optgroup>");
	   } else {
		  $('#aLabel').append("<optgroup id='lOptgroup_"+i+"' label='"+competition.name+"'></optgroup>");
	   }
	   
       for(var label in zgyh['深圳市分行'][0].label[group]) {
		   
		 if(group === 'achievement') {
		 	$("optgroup#lOptgroup_"+i).append("<option value='"+group+","+label+"'>"+achievement[label]+"</option>");
		 } else if(group === 'subject'){
		 	$("optgroup#lOptgroup_"+i).append("<option value='"+group+","+label+"'>"+subject[label]+"</option>");
		 } else if(group === 'population'){
		 	$("optgroup#lOptgroup_"+i).append("<option value='"+group+","+label+"'>"+population[label]+"</option>");
		 } else if(group === 'support'){
		 	$("optgroup#lOptgroup_"+i).append("<option value='"+group+","+label+"'>"+support[label]+"</option>");
		 } else {
		 	$("optgroup#lOptgroup_"+i).append("<option value='"+group+","+label+"'>"+competition[label]+"</option>");
		 }
	   }
	   
	  i++;
  }

  $('#aLabel').selectpicker('val', ['competition,l1','competition,l2']).trigger("change");
  $('#aLabel').selectpicker("refresh");
}

/**
 * Build Charts
 */
function mCharts() {
	
  var banks = $("#aBank").val();
  var labels = $("#aLabel").val();
  
  // 1. 空表
  cData = { source: [] };
  document.getElementById('cChart').style.width = window.innerWidth + 'px';
  if(banks.length == 0 || labels.length == 0) {
     echarts.init(document.getElementById('cChart')).setOption(cOption(null, cData, null), true, true);
     return;
  }

  // 2. 维度
  var bg = [];
  var bk = [];
  for(var i = 0; i < banks.length; i++) {
     bg.push(banks[i].split(",")[0]);
     bk.push(banks[i].split(",")[1]);
  }
  
  var lg = [];
  var ll = [];
  for(var i = 0; i < labels.length; i++) {
     lg.push(labels[i].split(",")[0]); 
	 if(labels[i].split(",")[0] === 'achievement') {
       ll.push(achievement[labels[i].split(",")[1]]);
	 } else if(labels[i].split(",")[0] === 'subject'){
       ll.push(subject[labels[i].split(",")[1]]);
	 } else if(labels[i].split(",")[0] === 'population'){
       ll.push(population[labels[i].split(",")[1]]);
	 } else if(labels[i].split(",")[0] === 'support'){
       ll.push(support[labels[i].split(",")[1]]);
	 } else {
       ll.push(competition[labels[i].split(",")[1]]);
	 } 
  }
  
  bg = unique(bg);
  bk = unique(bk); 
  
  lg = unique(lg);
  ll = unique(ll);

  // 3. 度量
  var vl = [];
  for(var i = 0; i < bg.length; i++) { // 同区
	  for(var j = 0; j < zgyh[bg[i]].length; j++) {
		  if(bk.indexOf(zgyh[bg[i]][j].name) > -1) { // 同行
	        for(var k = 0; k < lg.length; k++) { // 同组
	          for(var l = 0; l < labels.length; l++) { // 同标
                if(lg[k] === 'achievement') {
				     vl.push(zgyh[bg[i]][j].name +","+achievement[labels[l].split(",")[1]]+"," +zgyh[bg[i]][j].label[lg[k]][labels[l].split(",")[1]]);
				} else if(lg[k] === 'subject'){
				     vl.push(zgyh[bg[i]][j].name +","+subject[labels[l].split(",")[1]]+"," +zgyh[bg[i]][j].label[lg[k]][labels[l].split(",")[1]]);
				} else if(lg[k] === 'population'){
				     vl.push(zgyh[bg[i]][j].name +","+population[labels[l].split(",")[1]]+"," +zgyh[bg[i]][j].label[lg[k]][labels[l].split(",")[1]]);
				} else if(lg[k] === 'support'){
				     vl.push(zgyh[bg[i]][j].name +","+support[labels[l].split(",")[1]]+"," +zgyh[bg[i]][j].label[lg[k]][labels[l].split(",")[1]]);
				} else {
				     vl.push(zgyh[bg[i]][j].name +","+competition[labels[l].split(",")[1]]+"," +zgyh[bg[i]][j].label[lg[k]][labels[l].split(",")[1]]);
				}
			  }
		    }
		  }
	  }
  }
  
  // 4. 封装
  var sData = [];
  for(var i = 0; i < bk.length; i++) {
	  sData.push({type: 'bar'});
  }
  
  var sc = [];
  var tm = [];

  for(var i = 0; i < ll.length; i++) {
	  tm = [];
	  tm.push(ll[i]);
      for(var j = 0; j < vl.length; j++) { 
          if(ll[i] == vl[j].split(",")[1]){
		    tm.push(vl[j].split(",")[2]);
	      }
      }
	  
	 sc.push(tm);
  }
 
  bk.unshift('ll');
  sc.unshift(bk); 
  cData = { source: sc };
  
  // 5. 绘制
  echarts.init(document.getElementById('cChart')).setOption(cOption(bk, cData, sData), true, true);
 
}

/**
 * Build Option
 */
function cOption(lData, cData, sData) {
  return { 
			title: { text: '', subtext: '' }, 
			tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, textStyle: {fontSize: 10} }, 
		    toolbox: {
				show: true,
				itemSize: 10,
				orient: 'vertical',
				left: 'right',
				top: 'center',
				showTitle: false,
				feature: {
					mark: {show: true},
					dataView: {show: false, readOnly: false},
					magicType: {show: true, type: ['line', 'bar', 'stack', 'tiled']},
					restore: {show: true},
					saveAsImage: {show: true} 
				}
            },
			legend: { data: lData, type: 'scroll', itemHeight:10, textStyle: {fontSize: 10} }, 
			grid:{ x:38, y:30, x2:48, y2:30 }, 
			dataset: cData, 
			xAxis: {type: 'category', nameTextStyle: {color: '#999999', fontSize: 9}}, 
			yAxis: {nameTextStyle: {color: '#999999', fontSize: 9}}, 
			series: sData
		 };
}

/**
 * Build Fliter
 */
function cFilter() {
  return "<div class='row'><div class='col-xs-5 select'><div class='form-group'><i class='fa fa-sitemap' style='color:#999999'></i>&nbsp;&nbsp;<h8>网点</h8>&nbsp;&nbsp;<select id='aBank' class='selectpicker' data-live-search='true' data-max-options='12' data-size=6 multiple onchange='mCharts()'></select></div></div><div class='col-xs-5 select'><div class='form-group'><i class='fa fa-bar-chart' style='color:#999999'></i>&nbsp;&nbsp;<h8>标签</h8>&nbsp;&nbsp;<select id='aLabel' class='selectpicker' data-live-search='true' data-max-options='20' data-size=6 multiple onchange='mCharts()'></select></div></div></div>"
}

/**
 * Build Markers
 */
function mMarks() {

  mPois(mNo);  
  
  for(var group in zgyh) { 
	  for(var j = 0; j < zgyh[group].length; j++) { 
	    mMarker(zgyh[group][j]);
	  }
  }

  ciLayer.addLayers(bMarkers);  

  mCircle($('.selectpicker').val().split(","));
}

/**
 * Build Center
 * @param obj
 */
function mCenter(obj) {
    var cBank = obj.options[obj.selectedIndex].value.split(",");
    map.setView([ cBank[0], cBank[1] ], 16);
	mCircle(cBank); 
}

/**
 * Build Marker
 * @param cBank
 */
function mMarker(cBank) {
    var icon = L.icon({ iconUrl: '../assets/images/marker/bank/boc.png', iconSize: [22, 35], iconAnchor: [11, 6] });
	var marker = L.marker([ cBank.position.lat, cBank.position.lng ], { icon: icon }).bindPopup(cPanel(cBank), { minWidth:290, maxHeight:300, keepInVie: true })
	bMarkers.push(marker);
}

/**
 * Build Circle
 * @param cBank
 */
function mCircle(cBank) {
	
	layerGroup.clearLayers(); 
	var circle = L.circle([ cBank.position == undefined ? cBank[0] : cBank.position[0], cBank.position == undefined ? cBank[1] : cBank.position[1] ], 1000, { color: '#337ab7', weight: 1, fillColor: '#ECF0F4', fillOpacity: 0.2 }).addTo(map);
	map.addLayer(layerGroup.addLayer(circle));
	
    map.setView([ cBank.position == undefined ? cBank[0] : cBank.position[0], cBank.position == undefined ? cBank[1] : cBank.position[1] ], 16);
}


/**
 * Find Pois
 * @param mNo
 */
function mPois(mNo) {  

    // 联动
	this.mNo = mNo;
	
    // 标签
	$("#"+mNo+"").addClass("active");
	$("li").not("#"+mNo+"").removeClass("active");
     
    // 清除
	rMarker(); 
	rHeatLayer();
	
    var pois = [];
	var options = {};
	var icon = '';
	
	if(mNo === 'tyyh') { // 同业网点
		pois = tyyh;
		icon = L.icon({ iconUrl: '../assets/images/marker/bank/bank.png', iconSize: [22, 22], iconAnchor: [10, 10] });
	} else if(mNo === 'gsyh') {  // 工商银行
        pois = gsyh;
		icon = L.icon({ iconUrl: '../assets/images/marker/bank/icbc.png', iconSize: [22, 22], iconAnchor: [12, 10] });
	} else if(mNo === 'jsyh') {  // 建设银行
        pois = jsyh;
		icon = L.icon({ iconUrl: '../assets/images/marker/bank/ccb.png', iconSize: [22, 22], iconAnchor: [12, 10] });
	} else if(mNo === 'nyyh') {  // 农业银行
        pois = nyyh;
		icon = L.icon({ iconUrl: '../assets/images/marker/bank/abc.png', iconSize: [22, 22], iconAnchor: [12, 10] });
	} else if(mNo === 'zsyh') {  // 招商银行
        pois = zsyh;
		icon = L.icon({ iconUrl: '../assets/images/marker/bank/cmb.png', iconSize: [22, 22], iconAnchor: [12, 10] });
	} else if(mNo === 'zzyh') { // 自助银行
		pois = zzyh;
		icon = L.icon({ iconUrl: '../assets/images/marker/pois/auto.png', iconSize: [22, 22], iconAnchor: [10, 10] });
	} else if(mNo === 'zfdw') { // 政府单位
		pois = zfdw;        
		icon = L.icon({ iconUrl: '../assets/images/marker/pois/star.png', iconSize: [22, 22], iconAnchor: [10, 10] });
	} else if(mNo === 'zzxq') { // 住宅区
        pois = zzxq;
		icon = L.icon({ iconUrl: '../assets/images/marker/pois/home.png', iconSize: [22, 22], iconAnchor: [10, 10] });
	} else if(mNo === 'xx') {   // 学校
        pois = xx;
		icon = L.icon({ iconUrl: '../assets/images/marker/pois/school.png', iconSize: [22, 22], iconAnchor: [10, 10] });
	} else if(mNo === 'yy') {   // 医院
        pois = yy;
		icon = L.icon({ iconUrl: '../assets/images/marker/pois/hospital.png', iconSize: [22, 22], iconAnchor: [10, 10] });
	} else if(mNo === 'gwzx') { // 购物中心
		pois = gwzx;
		icon = L.icon({ iconUrl: '../assets/images/marker/pois/buy.png', iconSize: [22, 22], iconAnchor: [10, 10] });
	} else if(mNo === 'sc') { // 大型超市
		pois = sc;
		icon = L.icon({ iconUrl: '../assets/images/marker/pois/sc.png', iconSize: [22, 22], iconAnchor: [10, 10] });
	}else if(mNo === 'syj') {  // 商业街
		pois = syj;
		icon = L.icon({ iconUrl: '../assets/images/marker/pois/street.png', iconSize: [22, 22], iconAnchor: [10, 10] });
	}else if(mNo === 'dxwd') {  // 电信网点
        pois = dxwd;
		icon = L.icon({ iconUrl: '../assets/images/marker/pois/dxwd.png', iconSize: [22, 22], iconAnchor: [12, 10] });
	} else if(mNo === 'cyy') {  // 产业园
		pois = cyy;
		icon = L.icon({ iconUrl: '../assets/images/marker/pois/industrial-park.png', iconSize: [22, 22], iconAnchor: [10, 10] });
	} else if(mNo === 'xzl') {  // 写字楼
		pois = xzl;
		icon = L.icon({ iconUrl: '../assets/images/marker/pois/xzl.png', iconSize: [22, 22], iconAnchor: [10, 10] });
	} else if(mNo === 'dtz') {  // 地铁站
        pois = dtz;
		icon = L.icon({ iconUrl: '../assets/images/marker/pois/metro.png', iconSize: [22, 22], iconAnchor: [12, 10] });
	} else if(mNo === 'gjz') {  // 公交站
        pois = gjz;
		icon = L.icon({ iconUrl: '../assets/images/marker/pois/gjz.png', iconSize: [22, 22], iconAnchor: [12, 10] });
	} 
	else if(mNo === 'qy') {  // 企业 
      heat =  L.heatLayer(ordinary_enterprisies).addTo(map);					   
	}
	else if(mNo === 'gth') {  // 个体户
      heat =  L.heatLayer(gth_loc).addTo(map);	 
	} else {
		pois = [];
	} 
	
    pMarkers = [];
	
	for (var j = 0; j < pois.length; j++)
	  pMarkers.push(L.marker([ pois[j].position[0], pois[j].position[1] ], { icon: icon }).bindPopup(pPanel(pois[j]), { minWidth:240, maxHeight:120, keepInVie: true }));
    
	ciLayer.addLayers(pMarkers);
  
	map.setView([ map.getCenter().lat, map.getCenter().lng ], map.getZoom());  

}

/**
 * Remove Marker 
 */
function rMarker() {
	pMarkers.forEach(function (marker) {
      ciLayer.removeMarker(marker, false); 
	});
}

/**
 * Remove HeatLayer 
 */
function rHeatLayer(mNo) {	
    if(heat!= null)
	   map.removeLayer(heat);	
}
  
/**
 * Build Bank Popup
 * @param cBank
 */
function cPanel(cBank) {
	return  "<div class=\"page-header\"><ul class=\"list-group\"><p>"+cBank.name+"</p><h9 class=\"text-l2\"><i class=\"fa fa-phone-square\" style=\"color:#cccccc\"></i>&nbsp;&nbsp;"+cBank.telphone+"</h9>&nbsp;&nbsp;<h9 class=\"text-l2\"><i class=\"fa fa-external-link-square\" style=\"color:#cccccc\"></i>&nbsp;&nbsp;"+cBank.address+"</h9></ul></div>" +

			"<div class=\"page-header\">" +
				"<div class=\"tabbable\">" +
					"<ul class=\"nav nav-tabs\">" +
						"<li class=\"active\"><a href=\"#l1\" data-toggle=\"tab\">业绩</a></li>" +
						"<li><a href=\"#l2\" data-toggle=\"tab\">主体</a></li>" +
						"<li><a href=\"#l3\" data-toggle=\"tab\">人口</a></li>" +
						"<li><a href=\"#l4\" data-toggle=\"tab\">配套</a></li>" +
						"<li><a href=\"#l5\" data-toggle=\"tab\">竞争</a></li>" +
					"</ul>" +
					"<div class=\"tab-content\">" +
						"<div id=\"l1\" class=\"tab-pane active\">" +
							"<ul class=\"list-group\">" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.achievement.l1,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;存款金额</h9></li>" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.achievement.l2,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;贷款金额</h9></li>" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.achievement.l3,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;新增客户</h9></li>" +
							"</ul>" +
						"</div>" +
						"<div id=\"l2\" class=\"tab-pane\">" +
							"<ul class=\"list-group\">" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.subject.l1,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;个体户</h9></li>" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.subject.l2,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;一般企业</h9></li>" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.subject.l3,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;高新企业</h9></li>" +
							"</ul>" +
						"</div>" +
						"<div id=\"l3\" class=\"tab-pane\">" +
							"<ul class=\"list-group\">" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.population.l1,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;常住人口</h9></li>" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.population.l2,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;我行客户</h9></li>" +
							"</ul>" +
						"</div>" +
						"<div id=\"l4\" class=\"tab-pane\">" +
							"<ul class=\"list-group\">" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.support.l1,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;产业园</h9></li>" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.support.l2,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;地铁站</h9></li>" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.support.l3,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;公交站</h9></li>" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.support.l4,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;过境口岸</h9></li>" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.support.l5,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;火车站</h9></li>" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.support.l6,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;机场</h9></li>" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.support.l7,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;购物中心</h9></li>" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.support.l8,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;商业街</h9></li>" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.support.l9,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;学校</h9></li>" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.support.l10,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;政府单位</h9></li>" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.support.l11,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;住宅小区</h9></li>" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.support.l12,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;综合医院</h9></li>" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.support.l13,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;大型超市</h9></li>" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.support.l14,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;电信营业厅</h9></li>" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.support.l15,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;咖啡厅</h9></li>" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.support.l16,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;商务办公楼</h9></li>" +
							"</ul>" +
						"</div>" +
						"<div id=\"l5\" class=\"tab-pane\">" +
							"<ul class=\"list-group\">" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.competition.l1,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;同业网点</h9></li>" +
								"<li class=\"list-group-item\"><span class=\"badge\">"+format(cBank.label.competition.l2,3,',')+"</span><h9 class=\"text-l2\">&nbsp;&nbsp;自助银行</h9></li>" +
							"</ul>" +
						"</div>" +
					"</div>" +
				"</div>" +
			"</div>";
}

/**
 * Build Poi Popup
 * @param pBank
 */
function pPanel(pBank) {
	return "<div class=\"page-header\"><ul class=\"list-group\"><p>"+pBank.name+"</p><h9 class=\"text-l2\"><i class=\"fa fa-external-link-square\" style=\"color:#cccccc\"></i>&nbsp;&nbsp;"+pBank.address+"</h9></ul></div>";
}

/**
 * Format Number
 * @param val
 * @param step
 * @param splitor
 */
function format(val, step, splitor) {
	if (val == null) {
		val = '0';
	}
	val = val.toString();
	var len = val.length;

	if (len > step) {
		var l1 = len % step,
			l2 = parseInt(len / step),
			arr = [],
			first = val.substr(0, l1);
		if (first != '') {
			arr.push(first);
		};
		for (var i = 0; i < l2; i++) {
			arr.push(val.substr(l1 +i * step, step));
		};
		val = arr.join(splitor);
	};
	return val;
}


function unique(arr) {
	
	for(var i=0; i<arr.length; i++) { 
	   for(var j=i+1; j<arr.length; j++) { 
		if(arr[i] == arr[j]){
			arr.splice(j,1);
			j--;
		}
	   }
	}
	return arr;
}
