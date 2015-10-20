// Function to draw your map
var drawMap = function() {
	var map = L.map('container').setView([40.783, -97.3361], 4);
	var layer = L.tileLayer('http://a.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2hnYW8iLCJhIjoiY2lmeWJ0MXRkNHp6cXUxbTBkbjJ4enF1MSJ9.wVaBW9xW8WRIMTldWxbxBg');
	layer.addTo(map);
	getData(map);
	buildTable();
}

// Function for getting data
var getData = function(map) {
	var data;
	$.ajax({
		url:'data/response.json',
		success:function(dat) {
			data = dat;
			customBuild(data, map);
		}, 
		dataType:"json"
	});
}

// Loop through your data and add the appropriate layers and points
var customBuild = function(data, map) {
	var stat = [0, 0, 0, 0];
	var col = 'black';
	var layerGroup = [];
	var races = [];

	for (var i=0; i < data.length; i++) {
		if (data[i].Race == undefined) {
			data[i].Race = 'Unknown';
		} if (races.indexOf(data[i].Race) == -1) {
			races.push(data[i].Race);
			var newLayer = new L.LayerGroup([]);
			layerGroup.push(newLayer);
		} if (data[i]['Hit or Killed?'] == 'Killed') {
			col = 'red';
		}
		var circle = new L.circleMarker([data[i].lat, data[i].lng], {color: col, radius: '3'});
		circle.addTo(layerGroup[races.indexOf(data[i].Race)]);
		circle.bindPopup(data[i].Summary);
		col = 'black';

		if (data[i]['Victim\'s Gender'] == 'Male') {
			if (data[i]['Armed or Unarmed?'] == 'Armed')
				stat[0]++;
			else
				stat[1]++;
		} else {
			if (data[i]['Armed or Unarmed?'] == 'Armed')
				stat[2]++;
			else
				stat[3]++;
		}
	}

	for (var j=0; j < layerGroup.length; j++) {
		layerGroup[j].addTo(map);
	}

	var layers = {
		'Unknown': layerGroup[0]
	};

	for (var k=1; k < races.length; k++)
		layers[races[k]] = layerGroup[k];

	L.control.layers(null,layers).addTo(map);

	buildTable(stat);
}

var buildTable = function(stat) {
	var data = [["", "Men", "Women/unspecified"],
				["Armed", stat[0], stat[2]],
				["Unarmed/Unknown", stat[1], stat[3]]
	];

	var table = $('<table></table>').addClass('table table-striped');

	$.each(data, function(rowIndex, r) {
        var row = $("<tr></td>");
        $.each(r, function(colIndex, c) { 
        	if (rowIndex == 0)
        		row.append($("<th>").text(c));
            else
            	row.append($("<td>").text(c));
        });
        table.append(row);
    });

    $('#stats').append(table);
}