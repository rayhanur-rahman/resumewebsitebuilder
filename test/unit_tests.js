const chai = require("chai");
const expect = chai.expect;
const nock = require("nock");

const service = require("../service.js");

const data = require("../mock_data.json")


describe('testService', function () {

  nock("https://api.github.com")
    .persist()
    .get("/users/userName/repos")
    .reply(200, JSON.stringify(data['gitRepos']) );

  describe('#checkGitHubData()', function () {

   	it('should return valid object properties', function(done) {

      service.getGitData("testuser").then(function (results) 
      {
        expect(results).to.have.property("name");
        expect(results).to.have.property("description");

        done();
      });

    });

  });

});
