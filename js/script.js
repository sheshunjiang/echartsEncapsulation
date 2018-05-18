// 此对象依赖于echerts.js,地图GeoJson
function mapEcharts(ele,echarts,type){
	this.ele=ele;
	this.echarts=echarts;
	this.chart;
	this.type=type;
	this.disable=false;     //禁止绘画
}

mapEcharts.prototype.DropMapGeo=function(mapName,geoJsonData,option,callback){
	var ele=this.ele;
	var echarts=this.echarts;
	var regionName=mapName;
	var chart=this.chart;
	this.count++;
	if(chart){
		chart.dispose();
	}
	echarts.registerMap(regionName,geoJsonData);
	chart=echarts.init(ele);
	var options;
	if(this.type && this.type=="3D"){
		options={
			backgroundColor: option.backgroundColor? option.backgroundColor:"#ffffff",
			geo3D: {
		       map: mapName,
		       roam: true,
		       itemStyle: {
		           opacity: 1,
		           borderWidth: 0.4,
		           color: option.areaColor ? option.areaColor : '#99ff99',
				   borderColor: option.borderColor ? option.borderColor : '#111'
		       },
		       label: {
		           show: false,
		           textStyle:{
                        color:option.textColor ? option.textColor : '#000',
                        fontWeight : 'normal',
                        fontFamily:'sans-serif',
                        fontSize : 12,
                        backgroundColor: 'rgba(0,23,11,0)'
                    },
		        },
		        emphasis: { //当鼠标放上去  地区区域是否显示名称
		            itemStyle:{
                   		color: option.hoverColor ? option.hoverColor : '#00CED1'
                   }
		        },
		        regions:option.regionsData
		    },
		    series:[
				{
					name:regionName,
	                type : "map3D",
	                map:regionName,
	                geo3DIndex:0,
	                zlevel:-9,
	                label:{
	                   show:true,
	                   textStyle:{
	                        color:option.textColor ? option.textColor : '#000',
	                        fontWeight : 'normal',
	                        fontFamily:'sans-serif',
	                        fontSize : 12,
	                        backgroundColor: 'rgba(0,23,11,0)'
	                    },
	                     emphasis: {//对应的鼠标悬浮效果
	                        show: true,
	                    } 
	                },
	                itemStyle:{
	                	borderWidth:0.4,
				       	color: option.areaColor ? option.areaColor : '#99ff99',
				       	borderColor: option.borderColor ? option.borderColor : '#111',
	                },
	                emphasis: {
	                   itemStyle:{
	                   		color: option.hoverColor ? option.hoverColor : '#00CED1'
	                   }
	                },
	                viewControl: {
	                    autoRotate: false
	                    //distance: 70
	                },
	                data : option.seriesData
	            }
			],
			animation:true
		};
	}else{
		options={
			backgroundColor: option.backgroundColor? option.backgroundColor:"#ffffff",
			tooltip:{
				trigger:'axis',
				axisPointer:{
					type:"shadow"
				}
			},
			geo: {
				map: regionName,
				center:option.center,
			    roam:true,   //可以缩放地图
			    //selectedMode:'single',
			     zoom:option.zoom? option.zoom :1,
			    label: {
			      	show:true,
			      	color:option.textColor ? option.textColor : '#000',
			    },
			    itemStyle: {
			      	normal: {
			       		areaColor: option.areaColor ? option.areaColor : '#99ff99',
			       		borderColor: option.borderColor ? option.borderColor : '#111',
			       	},
			       	emphasis: {
			       		areaColor: option.hoverColor ? option.hoverColor : '#00CED1'
			       	}
			    },
				regions:option.regionsData
			},
			series:[
				{
					name:regionName,
	                type : "map",
	                geoIndex:0,
	                coordinateSystem:'geo',
	                map : regionName,
	                // zoom:1,
	                roam : true,
	                label:{
	                       show:true,
	                       color:"#FFF"
	                    },
	                coordinateSystem:'geo',
	                data : option.seriesData

	            }
			],
			animation:true
		};
	}
	chart.setOption(options);
	this.chart=chart;
	if(callback){
		callback();
	}
	return this;
}
//查找指定行政块数据所在指定地图中的相关信息
//mapName:'china' 地图名称
//params={
// 	name:"四川",    //行政区域名称
// 	id:"51"      //行政编号
// }
// 返回指定行政块在地图中相关数据
// return{
// 	name,id,index,cp等
// }
mapEcharts.prototype.search=function(mapName,params){
	var option=this.chart.getOption();
	var type="map";
	if(this.type){
		type=type+this.type;
	}
	var item={dataIndex:-1};
	for(var i=0;i<option.series.length;i++){
		if(option.series[i].type==type && option.series[i].name==mapName){
			for(var j=0;j<option.series[i].data.length;j++){
				if(option.series[i].data[j].id==params.id && option.series[i].data[j].name==params.name){
					item=option.series[i].data[j];
					item.dataIndex=j;
				}
			}
		}
	}
	return item;
}

//设置地图块的颜色
// params:{   //选中地图区域对象
//  mapName:china,    //地图名
//  id:'51',          //行政区域编号
//  name：'四川'      //行政区域名称
//  index:5,          //在地图中的索引号
// }
//color:颜色，支持普通颜色和渐变
// var color={					//线性渐变
// 	type: 'linear',
//     x: 0,
//     y: 0,
//     x2: 1,
//     y2: 1,
//     colorStops: [{
//         offset: 0, color: 'red' // 0% 处的颜色
//     }, {
//         offset: 1, color: 'blue' // 100% 处的颜色
//     }],
//     globalCoord: false // 缺省为 false
// };
// var color={           //径向渐变
//     type: 'radial',
//     x: 0.5,
//     y: 0.5,
//     r: 0.5,
//     colorStops: [{
//         offset: 0, color: 'red' // 0% 处的颜色
//     }, {
//         offset: 1, color: 'blue' // 100% 处的颜色
//     }],
//     globalCoord: false // 缺省为 false
// }
mapEcharts.prototype.setMapColor=function(params,color){
	var option=this.chart.getOption();
	var type="map";
	if(this.type){
		type=type+this.type;
	}
	for(var i=0;i<option.series.length;i++){
		if(option.series[i].type==type && option.series[i].name==params.mapName && option.series[i].data[params.dataIndex].id==params.id &&
		 option.series[i].data[params.dataIndex].name==params.name){
			if(!option.series[i].data[params.dataIndex].itemStyle){
				option.series[i].data[params.dataIndex].itemStyle={color:''};
			}
			option.series[i].data[params.dataIndex].itemStyle.color=color;
		}
	}
	this.chart.setOption(option);
}
//设置地图块的文字样式
// params:{   //选中地图区域对象
//  mapName:china,    //地图名
//  id:'51',          //行政区域编号
//  name：'四川'      //行政区域名称
//  index:5,          //在地图中的索引号
// }
// textStyle:{
// 	fontFamily:"sans-serif",   //字体
// 	fontSize:20,     //字号
// 	fontWeight:,   //加粗
// 	fontStyle:,    //斜体
// 	color:,        //颜色
// }
mapEcharts.prototype.setMapText=function(params,textStyle){
	var option=this.chart.getOption();
	var type="map"+this.type;
	if(this.type){
		for(var i=0; i<option.series.length;i++){
			if(option.series[i].type==type && option.series[i].name==params.mapName && option.series[i].data[params.dataIndex].id==params.id &&
			 option.series[i].data[params.dataIndex].name==params.name){
				if(!option.series[i].data[params.dataIndex].label){
					option.series[i].data[params.dataIndex].label={
						show:true,
						textStyle:{
							fontFamily:'',
							fontSize:'',
							fontWeight:'',
							color:''
						}
					};
				}
				option.series[i].data[params.dataIndex].label.textStyle.fontFamily=textStyle.fontFamily;
				option.series[i].data[params.dataIndex].label.textStyle.fontSize=textStyle.fontSize;
				option.series[i].data[params.dataIndex].label.textStyle.fontWeight=textStyle.fontWeight;
				option.series[i].data[params.dataIndex].label.textStyle.color=textStyle.color;
			}
		}
	}else{
		for(var i=0;i<option.geo[0].regions.length;i++){
			if(option.geo[0].regions[i].name==params.name){
				if(!option.geo[0].regions[i].label){
					option.geo[0].regions[i].label={
						fontFamily:'',
						fontSize:'',
						fontWeight:'',
						fontStyle:'',
						color:''
					};
				}
				option.geo[0].regions[i].label.fontFamily=textStyle.fontFamily;
				option.geo[0].regions[i].label.fontSize=textStyle.fontSize;
				option.geo[0].regions[i].label.fontWeight=textStyle.fontWeight;
				option.geo[0].regions[i].label.fontStyle=textStyle.fontStyle;
				option.geo[0].regions[i].label.color=textStyle.color;
			}
		}
	}
	this.chart.setOption(option);
}


//地图上绘制线条
//linesArr连接线段之间的点，如[[103.88,30.82],[104.05,30.70],[104.10,30.67],[104.43,30.85]]
//isShowSpot:是否显示线段之间的点，默认显示
//lineName:显得名称
//linesData:[{name: "大邑", coordinate: [103.83, 30.7]},{name: "大邑", coordinate: [103.83, 30.7]}]
//lineOption:线条的参数
// {
// 	color:"#ffffff",     //颜色,默认白色#ffffff
// 	width:1,			//宽,默认宽1
// 	type:"solid",		//类型 默认soild
// 	opacity:0.6		//透明度 默认值0.6
//  curveness:0      //线的曲率，默认为0
// }
// isShowSpot:true  是否显示线段拐点，true显示，false 不显示，不传入此参数默认不显示
mapEcharts.prototype.setDropLines=function(lineName,linesData,lineOption,isShowSpot){
	var linesArr=[];
	var markPointData=[];
	for(var i=0;i<linesData.length;i++){
		markPointData.push({
			"name":linesData[i].name,
			"coord":linesData[i].coordinate
		});
		if(i==linesData.length-1){
			break;
		}
		linesArr.push(
			{
				"coords":[linesData[i].coordinate,linesData[i+1].coordinate],
				"lineStyle":{
					"color": lineOption && lineOption.color ? lineOption.color : "#fff",
					"width":lineOption && lineOption.width ? lineOption.width : 1,
					"type":lineOption && lineOption.type ? lineOption.type : "solid",
					"opacity":lineOption && lineOption.opacity ? lineOption.opacity : 0.6
				}
			}
		);
	}
	var option=this.chart.getOption();
	var item={
        name:lineName,
        type: 'lines',
        //polyline:true,
        zlevel: 0,
        symbolSize: 10,
        data:linesArr,
        markPoint:{
        	symbol:'circle',
			symbolSize:isShowSpot ? 5:0,
			itemStyle:{
				color:'#fff'
			},
			data:markPointData
        },
        lineStyle:{
        	curveness:lineOption && lineOption.curveness ? lineOption.curveness:0
        }
	};
	option.series.push(item);
	this.chart.setOption(option);
	return item;                    //返回绘制的线对象
}

//清除线段
//lineObj:setDropLines返回的对象
mapEcharts.prototype.clearLine=function(lineObj){
	var option=this.chart.getOption();
	for(var i=0;i<option.series.length;i++){
		//if顺序不能变，先清除轨迹对应的动画，再清除轨迹线段
		if(option.series[i].name==lineObj.name+"Animation" && option.series[i].type==lineObj.type){
			option.series.splice(i,1);
			i-=1;
		}
		if(option.series[i].name==lineObj.name && option.series[i].type==lineObj.type){
			option.series.splice(i,1);
			i=i-1;
		}
	}
	this.chart.setOption(option,true);
}
//为线条设置动画
//trajectoryLine：setDropLines返回的对象
//lineAnimationOption:动画参数
// {
// 	period:4,					//动画时长
// 	delay:0,					//动画的延时,支持数字或回调
// 	constantSpeed:0,    //动画的速度，设置大于0的数字后period将失效
// 	symbol:'circle',     //图像的标记，可以是图片途径
// 	color:'#CD0000',		 //标记的颜色
// 	symbolSize:3,         //标记的大小
// 	trailLength:0.2,      //特效尾迹的长度，取值范围（0-1）数值越大，尾迹越长
// 	loop:true,            //是否循环动画
// }
//isStartUp:是否启用动画，true开启动画，false关闭动画
mapEcharts.prototype.setLineAnimation=function(trajectoryLine,lineAnimationOption,isStartUp){
	var option=this.chart.getOption();
	var coordsArr=[];
	for(var i=0;i<trajectoryLine.data.length;i++){
		coordsArr.push(trajectoryLine.data[i].coords[0]);
		if(i==trajectoryLine.data.length-1){
			coordsArr.push(trajectoryLine.data[i].coords[1]);
		}
	}
	var polyline=true;
	if(trajectoryLine.data.length==1){
		polyline=false;
	}
	var item={
        name: trajectoryLine.name + 'Animation',
        type: 'lines',
        polyline:polyline,
        zlevel:Math.random()*10,
        //zlevel: Math.round(Math.random()*100),
        effect: {
            show: isStartUp ? isStartUp : true,
            period: lineAnimationOption ? lineAnimationOption.period : 6,
            delay: lineAnimationOption ? lineAnimationOption.delay : 0,					
			constantSpeed: lineAnimationOption ? lineAnimationOption.constantSpeed : 0,    
			symbol: lineAnimationOption ? lineAnimationOption.symbol : 'circle',     
			color: lineAnimationOption ? lineAnimationOption.color : '#fff',		 
			symbolSize: lineAnimationOption ? lineAnimationOption.symbolSize : 3,         
			trailLength: lineAnimationOption ? lineAnimationOption.trailLength : 0.2,      
			loop:lineAnimationOption ? lineAnimationOption.loop : true,       
        },
        lineStyle: {
            normal: {
                width: 0,
                opacity:0.6,
                curveness:!polyline && trajectoryLine.lineStyle.curveness ? trajectoryLine.lineStyle.curveness:0
            }
        },
        data: [
        	{coords:coordsArr}
        ]
    }
    for(var i=0;i<option.series.length;i++){
    	if(option.series[i].type==item.type && option.series[i].name==item.name){
    		option.series.splice(i,1);
    		break;
    	}
    }
	option.series.push(item);
	this.chart.setOption(option);
	return item;
}

//动画开启与关闭
/*
lineAnimation:动画对象，setLineAnimation的返回值
isClose：是否关闭动画，true：关闭动画，false：开启动画
*/
mapEcharts.prototype.closeLineAnimation=function(lineAnimation,isClose){
	var option=this.chart.getOption();
	for(var i=0;i<option.series.length;i++){
		if(option.series[i].name==lineAnimation.name && option.series[i].type==lineAnimation.type){
			option.series[i].effect.show=isClose? !isClose : true;
		}
	}
	this.chart.setOption(option);
	console.log(this.chart.getOption());
}

//设置线的颜色
/*
line:setDropLines返回的线段对象
lineStyle:{             //线段配置参数
	color:"#ddd",       //颜色
	width:1,			//线宽
	type:'solid',		//线段类型（solid,dotted,dashed）
	opacity:1           //透明度
}
dataIndex:0             //line线段有可能由多条线段组成，dataIndex代表其中每段的索引值，如果传入此参数，则修改该线段索引值对应的子线段样式，
不传入此参数，则代表修改所有该线段所有子线段的样式
*/
mapEcharts.prototype.setLineStyle=function(line,lineStyle,dataIndex){
	var option=this.chart.getOption();
	for(var i=0;i<option.series.length;i++){
		if(option.series[i].name==line.name && option.series[i].type==line.type){
			var data=option.series[i].data;
			if(dataIndex >= 0){
				data[dataIndex].lineStyle.color= lineStyle && lineStyle.color ? lineStyle.color : data[dataIndex].lineStyle.color;
				data[dataIndex].lineStyle.width=lineStyle && lineStyle.width ? lineStyle.width : data[dataIndex].lineStyle.width;
				data[dataIndex].lineStyle.type=lineStyle && lineStyle.type ?lineStyle.type : data[dataIndex].lineStyle.type;
				data[dataIndex].lineStyle.opacity=lineStyle && lineStyle.opacity ? lineStyle.opacity : data[dataIndex].lineStyle.opacity;
			}else{
				for(var j=0;j<data.length;j++){
					data[j].lineStyle.color= lineStyle && lineStyle.color ? lineStyle.color : data[j].lineStyle.color;
					data[j].lineStyle.width=lineStyle && lineStyle.width ? lineStyle.width : data[j].lineStyle.width;
					data[j].lineStyle.type=lineStyle && lineStyle.type ?lineStyle.type : data[j].lineStyle.type;
					data[j].lineStyle.opacity=lineStyle && lineStyle.opacity ? lineStyle.opacity : data[j].lineStyle.opacity;
				}
			}
			break;
		}
	}
	this.chart.setOption(option);
}

//地图上绘制点
/*
spotsName:点名字,
spotData:[{"text":"海西蒙古族藏族自治州","coordinate":[94.9768,37.1118],value:5},{"text":"玉树藏族自治州","coordinate":[93.5925,33.9368],value:6}] 点数据
spotOption:{		//点的配置参数
	color:'#ffffff',     //点的颜色
	opacity:1,          //透明度
	symbol:'image://../img/home.png',     //图形形状，支持'circle,rect...，图片路径,矢量图等
	symbolSize:10,                      //图形大小
	symbolOffset:[0,-20],                //位置偏移量
	textStyle:{     //文字样式
		show:true,           //是否显示文字
		color:'#000',		//文字颜色
		fontSize:12,		//文字大小
		offset:[0,0]		//文字偏移量
	}
};
*/
mapEcharts.prototype.setDropSpot=function(spotsName,spotData,spotOption){
	var option=this.chart.getOption();
	var seriesData=[];
	var itemSeries=[];
	for(var i=0;i<spotData.length;i++){
		seriesData.push(
			{
				"name":spotData[i].text,
				"coordinate":spotData[i].coordinate,
				"value":spotData[i] && spotData[i].value ? spotData[i].coordinate.concat(spotData[i].value):spotData[i].coordinate.concat(0),
				"itemStyle":{
					"color":spotOption && spotOption.color? spotOption.color : '#ddd',
					"opacity":spotOption && spotOption.opacity ? spotOption.opacity : 1
				},
				"symbol":spotOption && spotOption.symbol? spotOption.symbol : 'circle',
				"symbolSize":spotOption && spotOption.symbolSize? spotOption.symbolSize : 10,
				"symbolOffset":spotOption && spotOption.symbolOffset? spotOption.symbolOffset : [0,0],
				"label":{
					"show":spotOption && spotOption.textStyle? spotOption.textStyle.show : true,
					"color":spotOption && spotOption.textStyle? spotOption.textStyle.color : '#000',
					"formatter":"{b}",
					"fontSize":spotOption && spotOption.textStyle? spotOption.textStyle.fontSize : 12,
					"offset":spotOption && spotOption.textStyle? spotOption.textStyle.offset : [0,-15]
				}
			}
		);
		itemSeries.push({
			seriesName: spotsName,
        	seriesType: 'scatter',
        	data: seriesData[i],
        	dataIndex:i
		});
	}
	option.series.push({
		name: spotsName,
        type: 'scatter',
        coordinateSystem: 'geo',
        data: seriesData,
		symbol:"circle",
        symbolSize: 12,
        hoverAnimation:false,
        zlevel:0,
        label: {
            normal: {
                show: true
            },
            emphasis: {
                show: false
            }
        }
	});
	this.chart.setOption(option);
	return itemSeries;
}

//设置标记点的图标文字
//params:setDropSpot返回的点对象
//text:文字描述
//textOption:文字样式描述
mapEcharts.prototype.setSpotText=function(params,text,textOption){
	var option=this.chart.getOption();
	var falg=true;
	if( isNaN(textOption.offset[0]) || isNaN(textOption.offset[0])){
		falg=false;
	}
	for(var i=0;i<option.series.length;i++){
		if(option.series[i].name==params.seriesName && params.seriesType=="scatter"){ 
			if(text && text !=""){
				option.series[i].data[params.dataIndex].name=text;
			}
			if(textOption.color && textOption.color!=""){
				option.series[i].data[params.dataIndex].label.color=textOption.color;
			}
			if(textOption.fontSize){
				option.series[i].data[params.dataIndex].label.fontSize=textOption.fontSize;
			}
			if(textOption.offset && textOption.offset.length==2 &&  falg){
				option.series[i].data[params.dataIndex].label.offset=textOption.offset;
			}
			break;
		}
	}
	this.chart.setOption(option);
}


//设置标记点的图片或图标类型
/*
params:setDropSpot返回的点对象
imgOption:{
	"symbol":'circle',     //图形形状，支持'circle,rect...，图片路径,矢量图等
	"symbolSize":15,		//图形大小
	"color":'#000'			 //图形颜色，当symbol为图片时，此参数无效
}
*/
mapEcharts.prototype.setSoptImg=function(params,imgOption){
	var option=this.chart.getOption();
	for(var i=0;i<option.series.length;i++){
		if(option.series[i].name==params.seriesName && params.seriesType=="scatter"){
			if(imgOption.symbol){
				option.series[i].data[params.dataIndex].symbol=imgOption.symbol;
			}
			if(imgOption.symbolSize){
				option.series[i].data[params.dataIndex].symbolSize=imgOption.symbolSize;
			}
			if(imgOption.color){
				option.series[i].data[params.dataIndex].itemStyle.color=imgOption.color;
			}
			break;
		}
	}
	this.chart.setOption(option);
}

//清除点
mapEcharts.prototype.clearSpot=function(params){
	var option=this.chart.getOption();
	for(var i=0;i<option.series.length;i++){
		for(var j=0;j<params.length;j++){
			if(option.series[i].name==params[j].seriesName && params[j].seriesType=="scatter"){
				for(var k=0;k<option.series[i].data.length;k++){
					if(option.series[i].data[k].name==params[j].data.name && option.series[i].data[k].name==params[j].data.name){
						option.series[i].data.splice(k,1);
						break;
					}
				}
			}
		}
	}
	for(var i=0;i<option.series.length;i++){
		if(option.series[i].data.length==0){
			option.series.splice(i,1);
		}
	}
	this.chart.setOption(option,true);
}

//清除所有绘制图形
mapEcharts.prototype.clearAll=function(){
	var option=this.chart.getOption();
	for(var i=0;i<option.series.length;i++){
		if(option.series[i].type!="map"){
			option.series.splice(i,1);
			i-=1;
		}
	}
	delete option.graphic;
	this.disable=true;
	this.chart.setOption(option,true);
}

//监听事件
mapEcharts.prototype.linster=function(eventName,callback){
     this.chart.on(eventName,function(params){
     	var param={};
     	if(params.seriesType=="scatter"){
     		param.data=params.data;
     		param.seriesName=params.seriesName;
     		param.seriesType="scatter";
     		param.dataIndex=params.dataIndex;
     		param.event=params.event;
     	}else if(params.seriesType=="lines"){
     		param.data=params.data;
     		param.seriesName=params.seriesName;
     		param.seriesType="lines";
     		param.dataIndex=params.dataIndex;
     		param.event=params.event;
     	}
     	else{
     		param=params;
     	}
        callback(param);
     });
}

//叠加散点图
/*
scatterName:散点图名称,
scatterData:散列图数据,如[{"text":"犀浦站","coordinate":[88.1653,39.6002],value:100},{"text":"犀浦站","coordinate":[88.1653,39.6002],value:100}]
scatterOption:{      //散列图配置参数
	color:'#FF00FF',  //颜色，
	symbol:'pin',     //图形符号
	symbolSize:20     //大小
}
symbolDynamicSize:{    //是否根据数据的value值来动态改变symbolSize的大小
isDynamicSize:true,    //true时scatterOption.symbolSize无效
size:5                 //用作value的除数，数值越大图标越小
}
colorDynamic:{         //是否根据value值动态改变图标的颜色
isDynamicColor:true,    //true时，scatterOption.color无效
color:['#9A32CD','#71C671','#0000FF'],   //颜色数组
min:0,                 //最小值
max:350                //最大值
}
*/
mapEcharts.prototype.overlyScatter=function(scatterName,scatterData,scatterOption,symbolDynamicSize,colorDynamic){
	var option=this.chart.getOption();
	var data=[];
	for (var i = 0; i < scatterData.length; i++) {
        data.push({
        	name:scatterData[i].text,
        	value:scatterData[i].coordinate.concat(scatterData[i].value)
        });
    }
    var symbolSize=scatterOption.symbolSize ? scatterOption.symbolSize:10;
    if(symbolDynamicSize && symbolDynamicSize.isDynamicSize){
    	symbolSize=function(val) {
                    return val[2] / (symbolDynamicSize.size ? symbolDynamicSize.size :10);
                };
    }
    if(colorDynamic && colorDynamic.isDynamicColor){
    	var item={
    		show:false,
			min: colorDynamic.min ? colorDynamic.min : 0,
			max: colorDynamic.max ? colorDynamic.max : 100,
			calculable: false,
			seriesIndex:option.series.length,
			inRange: {
				color:colorDynamic.color ? colorDynamic.color :['#d94e5d','#eac736','#50a3ba']
			}
    	};
    	if(option.visualMap){
    		option.visualMap.push(item);
    	}else{
	    	option.visualMap=item;
		}
    }
	option.series.push({
		 name: scatterName,
         type: 'scatter',
         coordinateSystem: 'geo',
         symbol:scatterOption.symbol ? scatterOption.symbol:'circle',
         symbolSize: symbolSize,
         itemStyle:{
					color:scatterOption.color? scatterOption.color : '#fff'
		 },
		 tooltip:{
		 	 trigger: 'item',
	        formatter: function (params) {
	            return params.name + ' : ' + params.value[2];
	        }
		 },
         data:data
	});
	this.chart.setOption(option);
}

//叠加柱状图
/*
barName:''   柱状图名称
geoData:{"榆林市":[109.1162, 32.7722],"延安市":[109.1052, 36.4252]}    //地理数据{城市名：地理坐标}
barData:[{"regionName":"凉山彝族自治州","xData":["数据A","数据B","数据C"],"yData":[100,200,30]},
		{"regionName":"乐山市","xData":["数据A","数据B","数据C","数据D"],"yData":[10,60,30,100]}]  //柱状图数据
barOption:{   //柱状图配置参数
	colorArr:['#F75D5D','#59ED4F','#4C91E7'],
	width:30 ,  // 柱状图宽
	height:40   //柱状图高
}
*/
mapEcharts.prototype.overlyBarChart=function(barName,geoData,barData,barOption){
	var that=this;
	var myChart=this.chart;
	var geoData=geoData;
	var barData=barData;
	renderEachCity();
	var throttledRenderEachCity = throttle(renderEachCity, 0);
	this.chart.on('geoRoam',throttledRenderEachCity);
	function renderEachCity(){
		if(that.disable){
			return;
		}
		var option={
			xAxis:[],
			yAxis:[],
			grid:[],
			series:[]
		};
		echarts.util.each(barData,function(dataItem,idx){
			var geoCoord = geoData[dataItem.regionName];
	        var coord = myChart.convertToPixel('geo', geoCoord);  //地理坐标转换
	        idx += '';

	        inflationData=dataItem.yData;
	        option.xAxis.push({
	            id: barName+idx,
	            gridId: barName+idx,
	            type: 'category',
	            //name: dataItem[0],
	            nameLocation: 'middle',
	            nameGap: 3,
	            splitLine: {
	                show: false
	            },
	            axisTick: {
	                show: false
	            },
	            axisLabel: {
	                show: false
	            },
	            axisLine: {
	            	show: false,
	                onZero: false,
	                lineStyle: {
	                    color: '#666'
	                }
	            },
	            data:dataItem.xData,
	            z: 2

	        });
	        option.yAxis.push({
	            id: barName+idx,
	            gridId: barName+idx,
	            splitLine: {
	                show: false
	            },
	            axisTick: {
	                show: false
	            },
	            axisLabel: {
	                show: false
	            },
	            axisLine: {
	                show: false,
	                lineStyle: {
	                    color: '#1C70B6'
	                }
	            },
	            z: 2
	        });
	        var width=barOption && barOption.width ? barOption.width:30;
	        var height=barOption && barOption.height ? barOption.height:40;
	        var left=coord[0] - width/2;
	        var top=coord[1] - height/2;
	        if(typeof width=="string" && width.indexOf("%")){
	        	left=coord[0]-myChart.getWidth()*parseInt(width)/100/2;
	        	top=coord[1]-myChart.getHeight()*parseInt(height)/100/2;
	        }
	        option.grid.push({
	            id: barName+idx,
	            width: width,
	            height: height,
	            left: left,
	            top:top,
	            show: false,
	            z: 2
	        });
	        option.series.push({
	            id: barName+idx,
	            type: 'bar',
	            xAxisId: barName+idx,
	            yAxisId: barName+idx,
	            barGap: 0,
	            barCategoryGap: 0,
	            data: inflationData,
	            z: 1,
	            itemStyle: {
	                normal: {
	                    color: function(params){
	                        // 柱状图每根柱子颜色
	                        var colorList =barOption && barOption.colorArr ? barOption.colorArr : ["#c23531", "#2f4554", "#61a0a8", "#d48265", "#91c7ae", "#749f83", "#ca8622", "#bda29a", "#6e7074", "#546570", "#c4ccd3"];
	                        return colorList[params.dataIndex];
	                    }
	                }
	            }
	        });
		});
		myChart.setOption(option);
		//点击图像
		// myChart.on('click',function(e){
		// 	if(e.componentSubType=="map"){
		// 		return;
		// 	}
		// 	var zhedang=that.creatWrap();
		// 	var divObj = document.createElement('div');
		// 	var divX = getMousePos()['x']; 
  //           var divY = getMousePos()['y']; 
  //           $(divObj).css({
  //               'width': 250,
  //               'height': 180,
  //               'border': '1px solid #ccc',
  //               'position': 'absolute',
  //               'top': divY,
  //               'left': divX
  //           });
  //           $(zhedang).append(divObj);
		// 	that.BarChart(divObj,barData[e.seriesId]);;
		// 	that.clearWrap(zhedang);
		// });
	}
}

//叠加饼形图
/*
pieName:饼状图名称，不能有同名
geoData:{"榆林市":[109.1162, 32.7722],"延安市":[109.1052, 36.4252]}    //地理数据{城市名：地理坐标}
pieData:[{regionName:"榆林市",data:[{value:335, name:'直接访问'},{value:310, name:'邮件营销'}]},
		{regionName:"榆林市",data:[{value:335, name:'直接访问'},{value:310, name:'邮件营销'}]    //饼形图数据
pineOption:{
	radius:'5%',     //半径大小，支持百分比或数字
	colorArr:['#F75D5D','#59ED4F','#4C91E7']     //饼状图颜色
}
*/
mapEcharts.prototype.overlyPieChart=function(pieName,geoData,pieData,pineOption){
	var that=this;
	var myChart=this.chart;
	//var option=myChart.getOption();
	var geoData=geoData;
	var pieData=pieData;
	renderEachCityPie();
	var throttledRenderEachCity = throttle(renderEachCityPie, 0);
	this.chart.on('geoRoam',function(){
		throttledRenderEachCity();
	});
	function renderEachCityPie(){
		if(that.disable){
			return;
		}
		var option={
			series:[]
		};
		echarts.util.each(pieData,function(dataItem,idx){
			var geoCoord = geoData[dataItem.regionName];
	        var coord = myChart.convertToPixel('geo', geoCoord);  //地理坐标转换
	        idx += '';
	        inflationData=dataItem.data;
	        option.series.push({
	            id: pieName+idx,
	            type: 'pie',
	            radius : pineOption.radius,
            	center:coord,
	            data: inflationData,
	            z: 0,
	            itemStyle: {
	                normal: {
	                    color: function(params){
	                        // 饼图每块区域颜色
	                        var colorList = pineOption.colorArr ? pineOption.colorArr : ["#c23531", "#2f4554", "#61a0a8", "#d48265", "#91c7ae", "#749f83", "#ca8622", "#bda29a", "#6e7074", "#546570", "#c4ccd3"];
	                        return colorList[params.dataIndex];
	                    }
	                }
	            },
	            labelLine:{
	            	show:false
	            },
	            label:{
	            	show:false
	            },
	            tooltip:{
	            	trigger: 'item'
	            }
	        });
		});
		myChart.setOption(option);
	}
}

// 缩放和拖拽时叠加图跟着改变
function throttle(fn, delay, debounce) {
    var currCall;
    var lastCall = 0;
    var lastExec = 0;
    var timer = null;
    var diff;
    var scope;
    var args;

    delay = delay || 0;

    function exec() {
        lastExec = (new Date()).getTime();
        timer = null;
        fn.apply(scope, args || []);
    }

    var cb = function() {
        currCall = (new Date()).getTime();
        scope = this;
        args = arguments;
        diff = currCall - (debounce ? lastCall : lastExec) - delay;

        clearTimeout(timer);

        if (debounce) {
            timer = setTimeout(exec, delay);
        } else {
            if (diff >= 0) {
                exec();
            } else {
                timer = setTimeout(exec, -diff);
            }
        }

        lastCall = currCall;
    };

    return cb;
}

//生成柱状图
mapEcharts.prototype.BarChart=function(ele,data){
	console.log(ele);
	var myChart = this.echarts.init(ele);
    var option = {
        backgroundColor: 'rgba(255,255,255,.3)',
        legend: {
            data: data.xData
        },
        xAxis: [
            {

                type: 'category',
                data: data.xData
            }
        ],
        yAxis: [
            {
                splitLine: {
                    show: false
                },
                type: 'value'
            }
        ],
        series: [
            {
            	name: 'bar'+data.regionName,
                type: 'bar',
                itemStyle: {
                    normal: {
                        color: function(params){
                            var colorList = ['#F75D5D','#59ED4F','#4C91E7'];
                            return colorList[params.dataIndex];
                        },
                        label: {
                            show: true,
                            position: 'top',
                            textStyle: {
                                color: '#000'
                            }
                        }
                    }
                },
                data: data.yData
            }
        ]
    };
    myChart.setOption(option);
    return myChart;
}

//生成遮罩层
mapEcharts.prototype.creatWrap=function(){
	var parentEle=$(this.ele).parent();
	if(!parentEle){
		return;
	}
    var zheDang = document.createElement('div');
    $(zheDang).addClass('zhedang').css({
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,.2)'
    });
    $(parentEle).append($(zheDang));
    return zheDang;
}

// 去掉遮挡层
mapEcharts.prototype.clearWrap=function(element){
	$(element).click(function(e){
		this.remove();
	});
}

// 获取鼠标横纵坐标
function getMousePos(e) {
    var e = event || window.event;
    var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
    var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
    var x = e.pageX || e.clientX + scrollX;
    var y = e.pageY || e.clientY + scrollY;
    // console.log(x,y)
    return {'x': x,'y': y};
}


//叠加热力图
/*
heatMapName:'heatMapName'  //热力图名称
seriesData:[[120.8057, 50.2185, 148],[120.8057, 50.2185, 148]]      //数据 ，数组中前两位（120.8057, 50.2185）为地理坐标，最后一位（148）为value值
heatOption:{       //配置参数
	min:0,         //最小值
	max:200,       //最大值
	color:['#d94e5d','#eac736','#50a3ba']   //颜色
}
*/
mapEcharts.prototype.overlyHeatMap=function(heatMapName,seriesData,heatOption){
	var option=this.chart.getOption();
	var item={
		"name":heatMapName,
		"type": 'heatmap',
        "coordinateSystem": 'geo',
        "data":seriesData

	};
	var visualMap={
		show:false,
		min: heatOption.min ? heatOption.min : 0,
		max: heatOption.max ? heatOption.max : 200,
		calculable: false,
		seriesIndex:option.series.length,
		inRange: {
			color:heatOption.color ? heatOption.color :['#d94e5d','#eac736','#50a3ba']
		}
	};
	if(option.visualMap){
		option.visualMap.push(visualMap);
	}else{
    	option.visualMap=visualMap;
	}
	option.series.push(item);
	this.chart.setOption(option);
}
//叠加图片
/*
name:'img1' 图片名字，不能重复
coords：地理坐标，图片叠加位置
imgOption:{   //图片参数
	imgPath:'../img/home.png',       //图片路径
	width:100,                   //图片宽
	height:100					//图片高
}
*/
mapEcharts.prototype.overlyImg=function(name,coords,imgOption){
	var that=this;
	var myChart=this.chart;
	rendImg();
	myChart.on("geoRoam",function(){
		rendImg();
	});
	function rendImg(){
		if(that.disable){
			return;
		}
		var option=myChart.getOption();
		var arr=myChart.convertToPixel('geo',coords);
		if(!option.graphic){
			option.graphic=[{}];
			option.graphic[0].elements=[];
		}
		for(var j=0;j<option.graphic[0].elements.length;j++){
			if((option.graphic[0].elements[j].id==name) && (option.graphic[0].elements[j].type=="image")){
				option.graphic[0].elements.splice(j,1);
				j-=1;
			}
		}
		var item={
			type:'image',
			id:name,
			z:1,
			zlevel:999,
			style:{
				image:imgOption.imgPath,
				x:arr[0]-imgOption.width/2,
				y:arr[1]-imgOption.height/2,
				width:imgOption.width,
				height:imgOption.height
			}
		};
		option.graphic[0].elements.push(item);
		myChart.setOption(option);
	}
}
//叠加贝塞尔曲线
/*
bazLineID:'' ,   //贝塞尔曲线的ID(注意ID不能重名)
dazData:[{name:"阿里地区",coord:[82.3645,32.7667]},{name:"阿里地区",coord:[82.3645,32.7667]}]   //绘制点所需的数据
bazOption:{       //相关配置参数
	lineWidth:1,      //线宽
	lineColor:'#ff0033',    //线的颜色
	spotRadius:5,           //节点的大小，为0时不显示节点
	spotColor:'#ccff33'      //线的颜色
}
gradualColor:{        //是否渐变色，此参数可省略，即不使用渐变色填充曲线
	isGradual:true,   //是否启用渐变色
	direction:[0,0,0,1],  //渐变方向,0,0,0,1(下-上);0,1,0,0(上-下);0,0,1,0(左-右);
	colors:[
		{               //起始颜色
			offset:0, 
			color: '#000000'
		},
		{               //终止颜色
			offset:1, 
			color: '#ffffff'
		}
	]
}
*/
mapEcharts.prototype.overlyBezierCurve=function(bazLineID,dazData,bazOption,gradualColor){
	if(!bazLineID){
		return;
	}
	var that=this;
	var falg=false;  //鼠标是否缩放过
	var myChart=this.chart;
	var dazData=dazData;
	var arr=[];
	arr=dazData;
	var data=[];
	dropBezierCurve();
	//var throttledRenderEachCity = throttle(dropBezierCurve, 0);
	this.chart.on("geoRoam",function(params){
		falg=true;
		dropBezierCurve();
	});
	function dropBezierCurve(){
		if(that.disable){
			return;
		}
		var option=myChart.getOption();
		data=[];
		for(var i=0;i<arr.length;i++){
			data.push(myChart.convertToPixel('geo',arr[i].coord));   //地理坐标转像素坐标
		}
		if(!option.graphic){
			option.graphic=[{}];
			option.graphic[0].elements=[];
		}
		if(falg){
			for(var j=0;j<option.graphic[0].elements.length;j++){
				if((option.graphic[0].elements[j].id==bazLineID) || (option.graphic[0].elements[j].type=="circle" && option.graphic[0].elements[j].bazLineID==bazLineID)){
					option.graphic[0].elements.splice(j,1);
					j-=1;
				}
			}
		}
		var strokeColor=bazOption.lineColor? bazOption.lineColor : '#000';
		if(gradualColor && gradualColor.isGradual){
			strokeColor=new echarts.graphic.LinearGradient(
                    gradualColor.direction[0], gradualColor.direction[1], gradualColor.direction[2], gradualColor.direction[3], 
                    gradualColor.colors
                );
		}
	    //线
		var polyline={
			type:"polyline",
			id:bazLineID,
			invisible:false,
			zlevel:0,
			z:2,
			shape:{
				points:data,
				smooth:0.5
			},
			 style:{
			 	lineWidth:bazOption.lineWidth ? bazOption.lineWidth:1,
	        	stroke:strokeColor,
	        },
		};
		option.graphic[0].elements.push(polyline);
	    //点
	    for(var i=0;i<data.length;i++){
	  		var ss={
	  			type: 'circle',
		        bazLineID:bazLineID,
		        textDesc:arr[i].name,
		        position: data[i],
		        shape: {
		            cx: 0,
		            cy: 0,
		            r: bazOption.spotRadius ? bazOption.spotRadius:5,
		        },
		        style:{
		        	fill:bazOption.spotColor ? bazOption.spotColor:'#000',
		        },
		        invisible: false,
		        draggable: true,
		        ondrag: echarts.util.curry(onPointDragging, i),
		        onmousemove: echarts.util.curry(showTooltip, i),
		        onmouseout: echarts.util.curry(hideTooltip),
		        z: 2
	  		}
		  	option.graphic[0].elements.push(ss);
		}
		myChart.setOption(option);

	}

	function showTooltip(dataIndex) {
	    var option=myChart.getOption();
	    var textObj={
	    	type:'text',
	    	invisible:false,
	    	style:{
	    		text:this.textDesc,
	    		x:this.position[0],
	    		y:this.position[1]-20,
	    		fill:"#fff"
	    	}
	    };
	     option.graphic[0].elements.push(textObj);
	     myChart.setOption(option,true);
	}

	function hideTooltip() {
	   var option=myChart.getOption();
	   for(var i=0;i<option.graphic[0].elements.length;i++){
		  if(option.graphic[0].elements[i].type=="text"){
		  	option.graphic[0].elements.splice(i,1);
		  	i-=1;
		  }
	   }
	   myChart.setOption(option,true);
	}

	function onPointDragging(dataIndex) {
	    var option=myChart.getOption();
	    data[dataIndex]=this.position;
	   //线的位置改变
	   var elements=option.graphic[0].elements;
	   var circleArr=[];     //小圆点数组
	   for(var i=0;i<elements.length;i++){
	   		if(elements[i].type=="polyline" && elements[i].id==this.bazLineID){
	   			 elements[i].shape.points=data;
	   		}
	   		if(elements[i].type=="circle" && elements[i].id==this.__ecGraphicId){    //点的位置改变
	   			elements[i].position=this.position;
	   		}
	   }
	   option.graphic.elements=elements;
	   arr[dataIndex].coord=myChart.convertFromPixel("geo",this.position);
	   myChart.setOption(option,true);
	}
}

//  //515贝塞尔曲线
// mapEcharts.prototype.dropBaz=function(arr){
//  	var myChart=this.chart;
//  	var option=myChart.getOption();
// 	var data=[];
// 	for(var i=0;i<arr.length;i++){
// 		data.push(myChart.convertToPixel('geo',arr[i].coord));   //地理坐标转像素坐标
// 	}
// 	console.log(data);
// 	var item={
// 		"type":"bezierCurve",
// 		"zlevel":100,
// 		"shape":{
// 			x1:data[0][0],
// 			y1:data[0][1],
// 			x2:data[5][0],
// 			y2:data[5][1],
// 			cpx1:data[1][0],
// 			cpy1:data[1][1],
// 			cpx2:data[2][0],
// 			cpy2:data[2][1],
// 			cpx3:data[3][0],
// 			cpy3:data[3][1],
// 			percent:1
// 		}
// 	};
// 	option.graphic[0].elements.push(item);
// 	myChart.setOption(option);
// }


// mapEcharts.prototype.setDropLinesBaz=function(lineName,linesData,lineOption){
// 	var linesArr=[];
// 	var markPointData=[];
// 	for(var i=0;i<linesData.length;i++){
// 		markPointData.push({
// 			"name":linesData[i].name,
// 			"coord":linesData[i].coordinate
// 		});
// 		if(i==linesData.length-1){
// 			break;
// 		}
// 		linesArr.push(
// 			{
// 				"coords":[linesData[i].coordinate,linesData[i+1].coordinate],
// 				"lineStyle":{
// 					"color": lineOption ? lineOption.color : "#fff",
// 					"width":lineOption ? lineOption.width : 1,
// 					"type":lineOption ? lineOption.type : "solid",
// 					"opacity":lineOption ? lineOption.opacity : 0.6,
// 					"curveness":0.5
// 				}
// 			}
// 		);
// 	}
// 	console.log(linesArr);
// 	var option=this.chart.getOption();
// 	var item={
//         name:lineName,
//         type: 'lines',
//         //polyline:true,
//         zlevel: 2,
//         symbolSize: 10,
//         data:linesArr,
//         markPoint:{
//         	symbol:'circle',
// 			symbolSize:5,
// 			data:markPointData
//         },
//         lineStyle:{
//         	curveness: 0.5
//         }

// 	};
// 	option.series.push(item);
// 	this.chart.setOption(option);
// 	return item;                    //返回绘制的线对象
// }

mapEcharts.prototype.zoomAnimation=function(){
	var myChart=this.chart;
	var count = null;
	var index=0;
    var zoom = function(per){
        if(!count) count = per;
        count = count + per;
        myChart.setOption({
            geo: {
                zoom: count
            }
        });
        if(count < 1){ 
        	index++;
        	window.requestAnimationFrame(function(){
            	zoom(0.2);
        	});
        }
        
    };
    window.requestAnimationFrame(function(){
        zoom(0.2);
    });

}


mapEcharts.prototype.setBaz=function(){
	arr=[
			{name:"长春",coord:[125.8154,44.2584]},
			{name:"呼和浩特",coord:[111.4124,40.4901]},
			{name:"乌鲁木齐",coord:[87.9236,43.5883]},
			{name:"成都",coord:[103.9526,30.7617]},
	];
	var data=[];
	for(var i=0;i<arr.length;i++){
		data.push(this.chart.convertToPixel('geo',arr[i].coord));   //地理坐标转像素坐标
	}
	var arr2=[
			{name:"贵阳",coord:[106.6992,26.7682]},
			{name:"长沙",coord:[113.0823,28.2568]},
			{name:"韶关",coord:[113.7964,24.7028]}
	];
	var data2=[];
	for(var i=0;i<arr2.length;i++){
		data2.push(this.chart.convertToPixel('geo',arr2[i].coord));   //地理坐标转像素坐标
	}
	var option=this.chart.getOption();

	option.series.push(
		{
			type: 'custom',
			coordinateSystem:"geo",
	        renderItem: function (params, api) {
	            // console.log(params);
	            // var categoryIndex = api.value(0);
	            // var start = api.coord([api.value(1), categoryIndex]);
	            // var end = api.coord([api.value(2), categoryIndex]);
	            // var height = api.size([0, 1])[1] * 0.6;


	            return {
	            	type: 'group',
	            	diffChildrenByName:true,
	           		children: [
	           			{
	           				type:"polyline",
			           		id:'sheshun',
			           		invisible:false,
			           		zlevel:0,
						 	z:100,
						 	shape:{
						 		points:data,
						 		smooth:0.5
						 	},
						 	style:{
						 		fill:null,
						 		lineWidth:2,
						 		stroke:"#ff0033"
						 	}
	           			},
	           			{
	           				type: 'circle',
					        position: data[0],
					        shape: {
					            cx: 0,
					            cy: 0,
					            r: 15
					        },
					        style:{
					        	fill:'#ccff33'
					        },
					        invisible: false,
	           			},
	           			{
	           				type:"line",
			           		id:'sheshun',
			           		invisible:false,
			           		zlevel:0,
						 	z:100,
						 	shape:{
						 		x1:data2[0][0],
						 		y1:data2[0][1],
						 		x2:data2[1][0],
						 		y2:data2[1][1],
						 	},
						 	style:{
						 		//fill:'',
						 		lineWidth:2,
						 		stroke:"#ff0033"
						 	}
	           			},
	           		],
	           		
	            };
	        },
	        data:arr,
	        animation:true,
	        animationDelay:500,
	        animationDuration:10000,
	        animationDurationUpdate:10000
		}
	);
	this.chart.setOption(option,true);
 }




