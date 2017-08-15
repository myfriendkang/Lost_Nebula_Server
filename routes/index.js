var express = require('express');
var router = express.Router();
var markets = [
 {
   "market_id": 0,
   "market_name": "pool",
   "value": 1,
   "quantity": 500
 },
 {
   "market_id": 1,
   "market_name": "Solar Panel",
   "value": 100,
   "quantity": 0
 },
 {
   "market_id": 2,
   "market_name": "Solar Sail",
   "value": 40,
   "quantity": 0
 },
 {
   "market_id": 3,
   "market_name": "Nuclear Fusion Reactor",
   "value": 120,
   "quantity": 0
 },
 {
   "market_id": 4,
   "market_name": "Biomass",
   "value": 70,
   "quantity": 0
 }
];
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Nebula Control' });
});
/*for (var i=1; i<markets.length; i++) {
   var market = markets[i];
   router.get('/market'+ market.market_id, function(req, res, next) {
     res.render('market', { className: 'market'+market.market_id });
   });
}*/

router.get('/market/:id', function(req, res, next) {
  res.render('market', { className: 'market'+req.params.id });
});

router.get('/market/:id/new', function(req, res, next) {
  res.render('market_new', { className: 'market'+req.params.id });
});

module.exports = router;
