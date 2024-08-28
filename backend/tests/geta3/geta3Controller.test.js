const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server.js');

chai.use(chaiHttp);
const { expect } = chai;

describe('Geta3Controller', () => {
  describe('/DELETE delete-geta3/:geta3Id', () => {
      it('it should delete a Geta3 post', (done) => {
          chai.request(server)
              .delete('/api/geta3/delete-geta3/sampleGeta3Id')
              .set('Authorization', 'Bearer sampleToken')
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.have.property('message').eql('Post deleted successfully');
                  done();
              });
      });
  });

  describe('/GET list/:carKind', () => {
      it('it should get a list of Geta3 posts by car kind', (done) => {
          chai.request(server)
              .get('/api/geta3/list/carKind')
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('array');
                  done();
              });
      });
  });

  describe('/GET Geta3-detail/:id', () => {
      it('it should get the details of a Geta3 post', (done) => {
          chai.request(server)
              .get('/api/geta3/Geta3-detail/sampleGeta3Id')
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  done();
              });
      });
  });

  describe('/GET comments/:id', () => {
      it('it should fetch comments for a Geta3 post', (done) => {
          chai.request(server)
              .get('/api/geta3/comments/sampleGeta3Id')
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('array');
                  done();
              });
      });
  });

  describe('/POST comments/:id', () => {
      it('it should add a comment to a Geta3 post', (done) => {
          const comment = {
              text: 'This is a comment'
          };
          chai.request(server)
              .post('/api/geta3/comments/sampleGeta3Id')
              .set('Authorization', 'Bearer sampleToken')
              .send(comment)
              .end((err, res) => {
                  res.should.have.status(201);
                  res.body.should.be.a('object');
                  done();
              });
      });
  });

  describe('/PUT comments/:id/:commentId', () => {
      it('it should edit a comment on a Geta3 post', (done) => {
          const comment = {
              text: 'This is an edited comment'
          };
          chai.request(server)
              .put('/api/geta3/comments/sampleGeta3Id/sampleCommentId')
              .set('Authorization', 'Bearer sampleToken')
              .send(comment)
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  done();
              });
      });
  });

  describe('/DELETE comments/:id/:commentId', () => {
      it('it should delete a comment on a Geta3 post', (done) => {
          chai.request(server)
              .delete('/api/geta3/comments/sampleGeta3Id/sampleCommentId')
              .set('Authorization', 'Bearer sampleToken')
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.have.property('message').eql('Comment deleted');
                  done();
              });
      });
  });

  describe('/POST add-favorite/:id', () => {
      it('it should add a Geta3 post to favorites', (done) => {
          chai.request(server)
              .post('/api/geta3/add-favorite/sampleGeta3Id')
              .set('Authorization', 'Bearer sampleToken')
              .end((err, res) => {
                  res.should.have.status(201);
                  res.body.should.be.a('object');
                  res.body.should.have.property('isFavorited').eql(true);
                  done();
              });
      });
  });

  describe('/POST remove-favorite/:id', () => {
      it('it should remove a Geta3 post from favorites', (done) => {
          chai.request(server)
              .post('/api/geta3/remove-favorite/sampleGeta3Id')
              .set('Authorization', 'Bearer sampleToken')
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('isFavorited').eql(false);
                  done();
              });
      });
  });

  describe('/GET top-favorites', () => {
      it('it should fetch the top favorite Geta3 posts', (done) => {
          chai.request(server)
              .get('/api/geta3/top-favorites')
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('array');
                  done();
              });
      });
  });

  describe('/GET top-retailers', () => {
      it('it should fetch the top retailers', (done) => {
          chai.request(server)
              .get('/api/geta3/top-retailers')
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('array');
                  done();
              });
      });
  });

  describe('/GET search', () => {
      it('it should search for Geta3 posts', (done) => {
          chai.request(server)
              .get('/api/geta3/search?searchTerm=test')
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('results');
                  done();
              });
      });
  });

  describe('/POST create', () => {
      it('it should create a new Geta3 post', (done) => {
          const post = {
              title: 'New Car Part',
              description: 'A description of the car part',
              related_link: 'http://example.com',
              condition: 'new',
              carType: 'Sedan',
              carModel: 'Model S',
              carManufacturingYear: 2023,
              price: 100.0
          };
          chai.request(server)
              .post('/api/geta3/create')
              .set('Authorization', 'Bearer sampleToken')
              .send(post)
              .end((err, res) => {
                  res.should.have.status(201);
                  res.body.should.be.a('object');
                  done();
              });
      });
  });

  describe('/GET geta3/:id/images', () => {
      it('it should fetch images for a Geta3 post', (done) => {
          chai.request(server)
              .get('/api/geta3/geta3/sampleGeta3Id/images')
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('images');
                  done();
              });
      });
  });

  describe('/PUT edit-post/:postId', () => {
      it('it should edit an existing Geta3 post', (done) => {
          const post = {
              title: 'Updated Car Part',
              description: 'An updated description of the car part',
              price: 150.0
          };
          chai.request(server)
              .put('/api/geta3/edit-post/samplePostId')
              .set('Authorization', 'Bearer sampleToken')
              .send(post)
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.have.property('message').eql('Post updated successfully');
                  done();
              });
      });
  });
});
