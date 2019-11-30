const chai = require("chai");
const expect = chai.expect;
const should = chai.should();
const nock = require("nock");

const service = require("../util.js");

const mock_data = require("../mock_data.json")
require('dotenv').config();





var gitHubToken = process.env.GITHUB_TOKEN;
var linkedInToken = process.env.LINKEDIN_TOKEN

describe('testService', function () {

  nock("https://api.github.com",{
        reqheaders: {
          'Authorization': gitHubToken
        },
      })
    .persist()
    .get("/users/bob_smith/repos")
    .reply(200, JSON.stringify(mock_data.gitRepos[0]));

  describe('#checkGitHubData()', function () {

   	it('should return valid object properties', function(done) {

      service.getGitHubData("bob_smith", gitHubToken).then(function (results) 
      {
        expect(results).to.have.property("name");
        expect(results).to.have.property("description");

        done();
      });

    });

  });

  nock("https://dblp.org")
  .persist()
  .get("/search/publ/api?q==author:bob_smith:&format=json")
  .reply(200, JSON.stringify(mock_data.dblp_profile));


  describe('#checkDBLPData()', function () {

   	it('should return valid object properties', function(done) {

      service.getDblpData("bob_smith").then(function (results) 
      {
      
        results.should.have.property('result')
        expect(results.result).to.have.property("hits");
        expect(results.result).to.have.property("completions");

        done();
      });

    });

  });

  var fields = "education,projects,skill";

    nock("https://api.linkedin.com/v2",{
        reqheaders: {
          'Authorization': linkedInToken
        },
      })
    .persist()
    .get("/people/bob?fields="+fields)
    .reply(200, JSON.stringify(mock_data.linkedInProfile));


  describe('#checkLinkedInData()', function () {

   	it('should return valid object properties', function(done) {

      service.getLinkedInData("bob", linkedInToken, fields).then(function (results) 
      {
        expect(results).to.have.property("firstName");
        expect(results).to.have.property("lastName");
        expect(results).to.have.property("profilePicture");
        done();
      });

    });

  });





});
