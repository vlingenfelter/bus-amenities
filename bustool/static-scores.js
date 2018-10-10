// declare variables for slider values
var vuln = document.getElementById("vulnsslider").value;
var transfers = document.getElementById("transferslider").value;
var origin = document.getElementById("originslider").value;

var perc_poc, perc_nv, perc_lic, perc_tap, perc_senTAP, zVuln, sorted, ranks, org;
var zPocAdj, zLicAdj, zNvAdj, zSenTapAdj, zOrg, zVuln, zTotal;
var pocMean, licMean, nvMean, senTAPMean, tapMean, orgMean;
var pocStd, licStd, nvStd, senTAPStd, tapStd, orgStd;


function resetVulnComponentLists() {
  perc_poc = [];
  perc_lic = [];
  perc_nv = [];
  perc_senTAP = [];
  zVuln = [];
  sorted = [];
  ranks = [];
  zPocAdj = [];
  zLicAdj = [];
  zNvAdj = [];
  zSenTapAdj = [];
  org = [];
  zTotal = [];
  zOrg = [];
}

function populateVulnComponentLists(features) {
  getSliderVals();

  for (var i = 0; i < features.length; i++) {
    perc_poc.push(features[i].properties.Perc_POC);
    perc_lic.push(features[i].properties.Perc_LIC);
    perc_nv.push(features[i].properties.Perc_NV);
    perc_senTAP.push(aggregateSenTap(features[i]));
    if (isNaN(features[i].properties.oriders)) {
      org.push(0);
    } else {
      org.push(features[i].properties.oriders);
    }
  }

  pocMean = mean(perc_poc);
  licMean = mean(perc_lic);
  nvMean = mean(perc_nv);
  senTAPMean = mean(perc_senTAP);
  orgMean = mean(org);

  pocStd = std(perc_poc);
  licStd = std(perc_lic);
  nvStd = std(perc_nv);
  senTAPStd = std(perc_senTAP);
  orgStd = std(org);

  for (var i = 0; i < features.length; i++) {
    features[i].properties.Zpoc = (features[i].properties.Perc_POC - pocMean) / pocStd;
    features[i].properties.Zlic = (features[i].properties.Perc_LIC - licMean) / licStd;
    features[i].properties.Znv = (features[i].properties.Perc_NV - nvMean) / nvStd;
    features[i].properties.ZsenTAP = (perc_senTAP[i] - senTAPMean) / senTAPStd;
    features[i].properties.Zorg = (org[i] - orgMean) / orgStd;
    zOrg.push(features[i].properties.Zorg);
    zPocAdj.push(adjustPOC(features[i].properties.Zpoc));
    //zPocAdj[i] *= .15;
    zLicAdj.push(adjustLIC(features[i].properties.Zlic));
    //zLicAdj[i] *= .15;
    zNvAdj.push(adjustNV(features[i].properties.Znv));
    //zNvAdj[i] *= .1;
    zSenTapAdj.push(adjustSenTap(features[i].properties.ZsenTAP));
    //zSenTapAdj[i] *= .3;
    zVuln[i] = zPocAdj[i] + zLicAdj[i] + zNvAdj[i] + zSenTapAdj[i];
    features[i].properties.Zvuln = zVuln[i];
    zVuln[i] *= scaleSlideVals(vuln);
    zOrg[i] *= scaleSlideVals(origin);
    zTotal[i] = zVuln[i] + zOrg[i];
  };
  var sorted = zTotal.slice().sort(function(a,b){return b-a})
  var ranks = zTotal.slice().map(function(v){ return sorted.indexOf(v)+1 });

  for (var i = 0; i < features.length; i++) {
    features[i].properties.rank = ranks[i];
  }
}

function adjustPOC(number) {
  number *= 0.15;
  return number;
}

function adjustLIC(number) {
  number *= 0.15;
  return number;
}

function adjustNV(number) {
  number *= 0.1;
  return number;
}

function adjustSenTap(number) {
  number *= 0.3;
  return number;
}

function aggregateSenTap(feature) {
  var aggregateVal = 0;
  aggregateVal += feature.properties.Perc_Sen;
  aggregateVal += feature.properties.Perc_TAP;
  return aggregateVal;
}

// updates slider values
// .... -> slider values
function getSliderVals() {
  vuln = document.getElementById("vulnsslider").value;
  transfers = document.getElementById("transferslider").value;
  origin = document.getElementById("originslider").value;
};

// scales the slider value to a percentage
// NatNum -> Float
function scaleSlideVals(slider) {
  slider = parseInt(slider);
  //slider += 1;
  //slider /= 5;
  return slider;
};

// calculates the score
function calcScore(props) {
  var tempVuln = parseFloat(props.Vulnerabil);
  var tempOrigin = parseFloat(props.Ridership);
  var tempTransfers = parseFloat(props.Ridership);
  tempVuln *= scaleSlideVals(vuln);
  tempOrigin *= scaleSlideVals(transfers);
  tempTransfers *= scaleSlideVals(origin);
  var tempTotal = parseFloat(props.totalScore);
  tempTotal = tempVuln + tempOrigin + tempTransfers;
  tempTotal /= 3;
  return tempTotal;
};

function updateJsonScores(features) {
  for (i = 0; i < features.length; i++) {
    features[i].properties.totalScore = calcScore(features[i].properties);
  };
  return features;
};

function mean(list) {
  var sum = 0;
  var mean = 0;
  for (var i = 0; i < list.length; i++) {
    sum += list[i]
  };
  return sum / list.length;
}

function std(list) {
  var sum = 0;
  var mean = 0;
  var std = 0;
  for (var i = 0; i < list.length; i++) {
    sum += list[i]
  };
  mean = sum / list.length;
  for (var i = 0; i < list.length; i++) {
    var counter = 0;
    counter = list[i] - mean;
    counter = Math.pow(counter, 2);
    std += counter
  };
  std = std / (list.length -1);
  std = Math.sqrt(std);
  return std;
}

// Style functions
function getColors(d) {
  return d < 10 ? '#510000':
    d < 100 ? '#a80a0a' :
    d < 500 ? '#e05050' :
    '#fbb4b9';
};

function getOutlineColors(d) {
  return d < 100 ? '#303030' :
    d < 500 ? '#707070' :
    '#aaaaaa';
};

function getRadius(d) {
  return d < 10 ? 12 :
    d < 100 ? 9 :
    d < 500 ? 6 :
    d < 1000 ? 3 :
    1;
};

function getOpacity(d) {
  return d < 10 ? 0.9 :
    d < 100 ? 0.7 :
    d < 500 ? 0.5 :
    d < 1000 ? 0.35 :
    0.3;
};
