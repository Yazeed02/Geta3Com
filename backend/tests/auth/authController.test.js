const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server.js');

chai.use(chaiHttp);
const { expect } = chai;


describe('AuthController', () => {
    describe('/POST check-email', () => {
        it('it should check if the email exists', (done) => {
            const email = { Email: 'test@example.com' };
            chai.request(server)
                .post('/api/auth/check-email')
                .send(email)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });

    describe('/POST register', () => {
        it('it should register a new user', (done) => {
            const user = {
                FirstName: 'John',
                LastName: 'Doe',
                Email: 'johndoe@example.com',
                PhoneNumber: '1234567890',
                Password: 'password123',
                Username: 'johndoe'
            };
            chai.request(server)
                .post('/api/auth/register')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });

    describe('/POST login', () => {
        it('it should log in an existing user', (done) => {
            const user = {
                LoginIdentifier: 'johndoe@example.com',
                Password: 'password123'
            };
            chai.request(server)
                .post('/api/auth/login')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('accessToken');
                    done();
                });
        });
    });

    describe('/POST verify-email', () => {
        it('it should verify a user email with OTP', (done) => {
            const data = {
                Email: 'johndoe@example.com',
                code: '123456'
            };
            chai.request(server)
                .post('/api/auth/verify-email')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('msg').eql('Email verified successfully');
                    done();
                });
        });
    });

    describe('/POST forgot-password', () => {
        it('it should send an OTP to reset the password', (done) => {
            const data = {
                Email: 'johndoe@example.com'
            };
            chai.request(server)
                .post('/api/auth/forgot-password')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });

    describe('/POST refresh_token', () => {
        it('it should refresh the access token', (done) => {
            const data = {
                refreshToken: 'sampleRefreshToken'
            };
            chai.request(server)
                .post('/api/auth/refresh_token')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('accessToken');
                    done();
                });
        });
    });

    describe('/POST logout', () => {
        it('it should log out the user', (done) => {
            const data = {
                refreshToken: 'sampleRefreshToken',
                token: 'sampleToken'
            };
            chai.request(server)
                .post('/api/auth/logout')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('User logged out successfully');
                    done();
                });
        });
    });

    describe('/POST send-phone-verification', () => {
        it('it should send a phone verification code', (done) => {
            const data = {
                PhoneNumber: '1234567890'
            };
            chai.request(server)
                .post('/api/auth/send-phone-verification')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });

    describe('/POST verify-phone', () => {
        it('it should verify the phone number with OTP', (done) => {
            const data = {
                PhoneNumber: '1234567890',
                code: '123456'
            };
            chai.request(server)
                .post('/api/auth/verify-phone')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });

    describe('/POST change-password', () => {
        it('it should change the user password', (done) => {
            const data = {
                newPassword: 'newPassword123',
                otpCode: '123456'
            };
            chai.request(server)
                .post('/api/auth/change-password')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('msg').eql('Password changed successfully');
                    done();
                });
        });
    });

    describe('/POST update-location', () => {
        it('it should update the user location', (done) => {
            const data = {
                Location: 'https://maps.app.goo.gl/sampleLocation'
            };
            chai.request(server)
                .post('/api/auth/update-location')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Location updated successfully');
                    done();
                });
        });
    });

    describe('/GET profile', () => {
        it('it should get the user profile', (done) => {
            chai.request(server)
                .get('/api/auth/profile')
                .set('Authorization', 'Bearer sampleToken')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('profile');
                    done();
                });
        });
    });

    describe('/PUT delete_profile', () => {
        it('it should delete the user profile', (done) => {
            chai.request(server)
                .put('/api/auth/delete_profile/sampleUserId')
                .set('Authorization', 'Bearer sampleToken')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('message').eql('User and their posts deleted successfully.');
                    done();
                });
        });
    });
});
