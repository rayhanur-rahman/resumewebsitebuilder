var sum = require('../sum');
var expect = require('chai').expect;
var assert = require('chai').assert;

var service_helper = require('../service-helper.js')
var service = require('../service.js')


async function foo(){
  
  var result = await service.ExtractingDBLPInfo(userId, "https://dblp.org/pers/hd/r/Rahman:Rayhanur");
  return result
}

describe('#checkExtractingDBLPData()', function () {
  it('should return true after collecting dblp profile', function() {
    const resolvingPromise = new Promise(async function (resolve) {
      var userId = "testuser123"
      var result = await service.ExtractingDBLPInfo(userId, "https://dblp.org/pers/hd/r/Rahman:Rayhanur");
      resolve(result);
    });
    resolvingPromise.then((res) => {
      console.log(res)
      assert.equal(res, true);
    })
 })
});

describe('#hudai', function(){
  it('should return undefined', async function(){
    var output = await service_helper.createRepo('hudai', '4ea3724f70b3227f0839a2209d094e39a3b921d3');
    assert.equal(output, false)
  })
});

describe('#sum()', function() {

  context('without arguments', function() {
    it('should return 0', function() {
      expect(sum()).to.equal(0)
    })
  })
  
  context('with number arguments', function() {
    it('should return sum of arguments', function() {
      expect(sum(1, 2, 3, 4, 5)).to.equal(15)
    })
    
    it('should return argument when only one argument is passed', function() {
      expect(sum(5)).to.equal(5)
    })
  })
  
  context('with non-number arguments', function() {
    it('should throw error', function() {
      expect(function() {
        sum(1, 2, '3', [4], 5)
      }).to.throw(TypeError, 'sum() expects only numbers.')
    })
  })
  
})

