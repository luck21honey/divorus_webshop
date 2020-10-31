module.exports = function (app, passport, fs, stripe, uuid) {
  //backend routes
  app.get('/admin', function (req, res) {
    res.render('backend/login.ejs');
  });

  app.get('/dashboard', function (req, res) {
    console.log(req.session.username)
    if (req.session.username) {
      db.query('Select * from plan_subscription order by updated_at DESC', function (err, result) {
        db.query('Select * from contactus order by updated_at DESC', function (err, messages) {
          db.query('Select * from todolist order by updated_at DESC', function (err, todolist) {
            db.query('Select count(*) as total from contactus where is_read=0', function (err, messagesT) {
              global.total_contact_unread = messagesT[0].total;
              res.render('backend/index.ejs', { result: result, messages: messages, todolist: todolist });
            });
          });
        });
      });
    } else {
      return res.redirect('/admin');
    }
  });

  app.get('/logout', (req, res, next) => {
    req.session.destroy();
    return res.redirect('/admin');
  });

  app.post('/login', (request, response, next) => {

    const users = [
      { id: '2f24vvg', email: 'admin@gmail.com', password: 'admin@123' }
    ]

    var username = request.body.email;
    var password = request.body.password;

    var username = request.body.email;
    //console.log(users[0].email,'users','body', username)

    if (username && password) {
      if (users[0].email == username && users[0].password == password) {
        request.session.loggedin = true;
        request.session.username = username;
        db.query('Select count(*) as total from contactus where is_read=0', function (err, messages) {
          global.total_contact_unread = messages[0].total;
          response.redirect('/dashboard');
        });

      } else {
        response.render('backend/login.ejs', { msg: 'Invalid login details' });
      }

      //response.end();

    } else {
      response.render('backend/login.ejs', { msg: 'Invalid login details' });
      //response.end();
    }
  })

  app.get('/finished_work', function (req, res) {
    //console.log(req.session.loggedin)
    if (req.session.username) {
      db.query('Select * from plan_subscription order by updated_at DESC', function (err, result) {


        db.query('Select count(*) as total from contactus where is_read=0', function (err, messages) {
          global.total_contact_unread = messages[0].total;
          res.render('backend/finished_work.ejs', { result: result });
        });
      });
    } else {
      return res.redirect('/admin');
    }
    //res.end();      
  });

  app.post('/finished_work_admin', function (req, res) {
    console.log(req.body);

    type = req.body.select == 'One-Time' ? '' : '';

    let query = "INSERT INTO `plan_subscription`  (stripe_customer_id,customer_name, customer_email,product,plan_price,subscription_id) VALUES ('Mannual Added','" + req.body.nf_name + "','" +
      req.body.nf_email + "','" + req.body.nf_product + "','" + req.body.nf_price + "','" + type + "')";
    db.query(query, (err, result) => {

      console.log(err, 'err');

      if (err) {
        res.status(200).send({ status: false, msg: err });
      }

      res.status(200).send({ status: true });
    });
  });

  app.get('/messages', function (req, res) {
    if (req.session.username) {
      db.query('Select * from contactus order by updated_at DESC', function (err, result) {
        db.query('Select count(*) as total from contactus where is_read=0', function (err, messages) {
          global.total_contact_unread = messages[0].total;
          res.render('backend/messages.ejs', { result: result });
        });
      });
    } else {
      return res.redirect('/admin');
    }
  });

  app.get('/todolist', function (req, res) {
    if (req.session.username) {
      db.query('Select * from categorias', function (err, categoria) {
        db.query('Select * from produtos', function (err, produto) {

          res.render('backend/todolist.ejs', { categoria: categoria, produto: produto });
        });
      });
    } else {
      return res.redirect('/admin');
    }
  });

  app.post("/save_product", async (req, res) => {
    var nome = req.body.nome;
    let descricao = req.body.descricao;
    let preco = req.body.preco;
    let category = req.body.category

    var file_name = req.files.images;
    if (req.files) {
      let sampleFile = req.files.images;
      let uni = new Date().getTime();
      file_name = uni + '_' + req.files.images.name
      sampleFile.mv('./public/imgcomment/' + file_name);


    }
    var values = [];
    values.push([nome, descricao, preco, file_name, category]);

    db.query('INSERT INTO produtos (nome, descricao, preco, images, categoria) VALUES ?', [values], function (err, result) {
      if (err) {
        error = 'SQL ERROR ' + err.sqlMessage;
      }
      else {
        error = 'Blog added successfully';
      }
      req.flash('success', error);
      res.redirect('/todolist');
    });
  });
  app.get("/delete_product", async (req, res) => {
    let id = req.query.id;
    let image = req.query.images;

    var sql = "DELETE FROM produtos WHERE id = '" + id + "'";
    var error = '';
    db.query(sql, function (err, produto) {
      if (err) {
        error = 'SQL ERROR ' + err.sqlMessage;
      }
      else {
        if (fs.existsSync('./imgcomment/' + image)) {
          fs.unlinkSync('./imgcomment/' + image);
        }
        error = 'Product Deleted successfully';
      }

      req.flash('success', error);
      res.redirect('/todolist');
    });
  });







  app.get('/message_read', function (req, res) {
    if (req.session.username) {
      var sql = "UPDATE contactus set is_read =?";
      var sql2 = "UPDATE contactus set status =?";
      var error = '';

      db.query(sql, [1]);
      db.query(sql2, [1]);

      db.query('Select * from contactus order by updated_at DESC', function (err, result) {
        db.query('Select count(*) as total from contactus where is_read=0', function (err, messages) {
          global.total_contact_unread = messages[0].total;
          res.render('backend/messages.ejs', { result: result });
        });
      });
    } else {
      return res.redirect('/admin');
    }
  });





  app.post('/get_status', function (req, res) {
    let query = "Select * from todolist where id = ('" + req.body.id + "')";
    db.query(query, function (err, result) {
      res.status(200).send({ result: JSON.parse(JSON.stringify(result)) });
    });
  });

  app.post('/update_todolist', function (req, res) {
    var sql = "UPDATE todolist set what =?,when_to =? WHERE id = ?";
    var error = '';

    db.query(sql, [req.body.what, req.body.when, req.body.id], function (err, result) {
      if (err) {
        res.status(200).send({ status: false });
      }

      res.status(200).send({ status: true });
    });
  });

  app.post('/deletetodo', function (req, res) {
    let query = "DELETE FROM todolist where id = ('" + req.body.id + "')";
    db.query(query, (err, result) => {
      if (err) {
        res.status(200).send({ status: false });
      }

      res.status(200).send({ status: true });
    });
  });

  app.post('/update_status', function (req, res) {
    var status = req.body.status == 1 ? 0 : 1;
    var values = [];
    values.push([status, req.body.id]);
    var sql = "UPDATE todolist set status =? WHERE id = ?";
    var error = '';
    db.query(sql, [status, req.body.id], function (err, result) {
      if (err) {
        res.status(200).send({ status: false });
      }

      res.status(200).send({ status: true });
    });
  });

  app.post('/todosave', function (req, res) {
    let query = "INSERT INTO `todolist`  (what, when_to) VALUES ('" + req.body.what + "','" +
      req.body.when + "')";
    db.query(query, (err, result) => {
      if (err) {
        res.status(200).send({ status: false, msg: err });
      }

      res.status(200).send({ status: true });
    });
  });

  //frontend routes
  app.get('/', function (req, res) {
    res.render('frontend/index.ejs');
  });

  app.get('/donate', function (req, res) {
    res.render('frontend/donate.ejs');
  });

  app.get('/contact', function (req, res) {
    res.render('frontend/contact.ejs');
  });
  app.get('/termos', function (req, res) {
    res.render('frontend/termos.ejs');
  });
  app.get('/politicas', function (req, res) {
    res.render('frontend/politicas.ejs');
  });
  app.get('/checkout', function (req, res) {
    res.render('frontend/checkout.ejs');
  });
  app.get('/shop', function (req, res) {

    var options = req.query.options;
    var preco = req.query.preco;
    let bookId = req.body.bookId;

    var search_param = [];
    if (options) {
      var innerObj = +options;
      search_param.push(innerObj)
    }
    if (preco) {
      var innerObj = +preco;
      search_param.push(innerObj)
    }


    var search_certi = '';
    if (search_param.length > 0) {
      var arr_len = search_param.length;
      search_param.forEach(function (entry, index) {
        var check = parseInt(index) + 1;

        if (check == arr_len) {
          search_certi += entry;
        } else {
          search_certi += entry + ' AND ';
        }

      });
    }





    var query = '';
    if (preco === '1' && options === '') {

      query = 'Select * from produtos  order by preco asc';
    } else {
      if (preco === '2' && options === '') {
        query = 'Select * from produtos  order by preco desc';
      } else if (preco === '1' && options != '') {
        query = 'Select * from produtos where categoria_id = ' + options + '  order by preco asc';
      } else if (preco === '2' && options != '') {
        query = 'Select * from produtos where categoria_id = ' + options + '  order by preco desc';
      } else if (preco === '' && options != '') {
        query = 'Select * from produtos where categoria_id = ' + options + '  order by data desc';
      } else if (search_certi === '') {
        query = 'Select * from produtos  order by data desc';
      }
    }

    db.query('Select * from categorias', function (err, categoria) {
      db.query("SELECT * FROM produtos where id = '" + bookId + "'", function (err, produto2) {
        db.query(query, (err, produto) => {
          console.log(search_certi)
          console.log(options)
          console.log(bookId)
          res.render('frontend/shop.ejs', { categoria: categoria, produto: produto, req: req, produto2: produto2 });
        });
      });
    });
  });






  app.get('/product-single', function (req, res) {
    let id = req.query.id;
    db.query("SELECT * FROM produtos where id = '" + id + "'", function (err, produto2) {
      res.render('frontend/product-single.ejs', { produto2: produto2 });
    });
  });
  app.get('/sucessomensagem', function (req, res) {
    res.render('frontend/sucessomensagem.ejs');
  });

  app.get('/pagamentos', function (req, res) {
    res.render('frontend/pagamentos.ejs');
  });

  app.get('/aboutus', function (req, res) {
    res.render('frontend/aboutus.ejs');
  });
  app.get('/cookies', function (req, res) {
    res.render('frontend/cookies.ejs');
  });
  app.get('/header', function (req, res) {
    res.render('frontend/backend/header.ejs');
  });
  app.get('/header2', function (req, res) {
    res.render('frontend/backend/header2.ejs');
  });

  app.get('/portoflio_single', function (req, res) {
    res.render('frontend/portoflio_single.ejs');
  });

  app.get('/payment/:type/:price', function (req, res) {
    console.log(req.params);
    console.log(req.headers.host);
    res.render('frontend/payment.ejs', {
      params: req.params,
      host: req.headers.host
    });
  });
  app.get('/payment-low-one/:type/:price', function (req, res) {
    console.log(req.params);
    console.log(req.headers.host);
    res.render('frontend/payment-low-one.ejs', {
      params: req.params,
      host: req.headers.host
    });
  });

  app.get('/payment-premium/:type/:price', function (req, res) {
    console.log(req.params);
    console.log(req.headers.host);
    res.render('frontend/payment-premium.ejs', {
      params: req.params,
      host: req.headers.host
    });
  });

  app.get('/payment-premium-one/:type/:price', function (req, res) {
    console.log(req.params);
    console.log(req.headers.host);
    res.render('frontend/payment-premium-one.ejs', {
      params: req.params,
      host: req.headers.host
    });
  });

  app.get('/payment-shop-one/:type/:price', function (req, res) {
    console.log(req.params);
    console.log(req.headers.host);
    res.render('frontend/payment-shop-one.ejs', {
      params: req.params,
      host: req.headers.host
    });
  });

  app.get('/payment-shop/:type/:price', function (req, res) {
    console.log(req.params);
    console.log(req.headers.host);
    res.render('frontend/payment-shop.ejs', {
      params: req.params,
      host: req.headers.host
    });
  });

  app.post('/payment_data', function (req, res) {
    let price = parseFloat(req.body.price);
    total = price.toFixed(2);
    total = parseFloat(total);
    var amountInCents = Math.floor(total * 100);
    var type = req.body.type;
    var token = req.body.token;

    if (type == 'donate') {
      stripe.customers.create({
        'name': req.body.customer_name,
        'description': 'Donated',
        'email': req.body.customer_email,
        'source': token,
        'address': {
          "city": req.body.address,
          "country": req.body.address,
          "line1": req.body.address,
          "line2": req.body.address,
          "postal_code": req.body.address,
          "state": req.body.address
        }
      }, function (err, response) {
        console.log(err, response, 'customer')
        if (err) {
          res.render('frontend/error.ejs', {
            msg: err,
            status: false
          });
        }

        let customer_id = response.id;

        stripe.charges.create({
          'customer': response.id,
          amount: amountInCents,
          currency: 'eur',
          'description': 'Donated',
          'address': {
            "city": req.body.address,
            "country": req.body.address,
            "line1": req.body.address,
            "line2": req.body.address,
            "postal_code": req.body.address,
            "state": req.body.address
          }
        }, function (err, response) {
          console.log(err, response, 'charges')
          if (err) {
            res.render('frontend/error.ejs', {
              msg: err,
              status: false
            });
          } else {

            console.log(response, 'response')
            let query = "INSERT INTO `plan_subscription` (customer_name, customer_phone, customer_email, stripe_customer_id,subscription_id,charge_id,plan_price,plan_type,customer_address) VALUES ('" + req.body.customer_name + "','" +
              req.body.customer_phone + "', '" + req.body.customer_email + "', '" + customer_id + "', '', '" + response.id + "', '" + price + "', 'fixed', '" + req.body.customer_address + "') ";
            db.query(query, (err, result) => {
              if (err) {

              }
            });

            res.render('frontend/success.ejs', {
              msg: 'Donated successfully',
              status: true
            });
          }
        });
      });
    }


    if (type == 'fixed') {
      stripe.customers.create({
        'name': req.body.customer_name,
        'description': 'Plan Charge',
        'email': req.body.customer_email,
        'source': token,
        'address': {
          "city": req.body.address,
          "country": req.body.address,
          "line1": req.body.address,
          "line2": req.body.address,
          "postal_code": req.body.address,
          "state": req.body.address
        }
      }, function (err, response) {
        console.log(err, response, 'customer')
        if (err) {
          res.render('frontend/error.ejs', {
            msg: err,
            status: false
          });
        }

        let customer_id = response.id;

        stripe.charges.create({
          'customer': response.id,
          amount: amountInCents,
          currency: 'eur',
          'description': 'Plan Charge',
          'address': {
            "city": req.body.address,
            "country": req.body.address,
            "line1": req.body.address,
            "line2": req.body.address,
            "postal_code": req.body.address,
            "state": req.body.address
          }
        }, function (err, response) {
          console.log(err, response, 'charges')
          if (err) {
            res.render('frontend/error.ejs', {
              msg: err,
              status: false
            });
          } else {

            console.log(response, 'response')
            let query = "INSERT INTO `plan_subscription` (customer_name, customer_phone, customer_email, stripe_customer_id,subscription_id,charge_id,plan_price,plan_type,customer_address) VALUES ('" + req.body.customer_name + "','" +
              req.body.customer_phone + "', '" + req.body.customer_email + "', '" + customer_id + "', '', '" + response.id + "', '" + price + "', 'fixed', '" + req.body.customer_address + "') ";
            db.query(query, (err, result) => {
              if (err) {

              }
            });

            res.render('frontend/success.ejs', {
              msg: 'Charge successfully',
              status: true
            });
          }
        });
      });
    }

    if (type == 'mes') {
      stripe.customers.create({
        'name': req.body.customer_name,
        'description': 'Subscription Lowcost website',
        'email': req.body.customer_email,
        'source': token,
        "address": {
          "city": req.body.address,
          "country": req.body.address,
          "line1": req.body.address,
          "line2": req.body.address,
          "postal_code": req.body.address,
          "state": req.body.address
        }
      }, function (err, response) {
        if (err) {
          res.render('frontend/error.ejs', {
            msg: err,
            status: false
          });
        }

        if (response.id) {
          var customer_id = response.id;
          stripe.subscriptions.create({
            'customer': customer_id,
            'items': [{
              'price': 'price_1HVi7GFbvuFDnNwpBzH50M11'
            },],
          }, function (err, response) {
            if (err) {
              res.render('frontend/error.ejs', {
                msg: err,
                status: false
              });
            } else {
              let query = "INSERT INTO `plan_subscription` (customer_name, customer_phone, customer_email, stripe_customer_id,subscription_id,charge_id,plan_price,plan_type,customer_address) VALUES ('" + req.body.customer_name + "','" +
                req.body.customer_phone + "', '" + req.body.customer_email + "', '" + customer_id + "', '" + response.id + "',' ','" + price + "', 'mes', '" + req.body.customer_address + "') ";

              db.query(query, (err, result) => {
                if (err) {

                }
              });

              res.render('frontend/success.ejs', {
                msg: 'Obrigado pela sua confiança',
                status: true
              });
            }
          });
        }

      });
    }
    if (type == 'mes2') {
      stripe.customers.create({
        'name': req.body.customer_name,
        'description': 'Subscription online-shop',
        'email': req.body.customer_email,
        'source': token,
        "address": {
          "city": req.body.address,
          "country": req.body.address,
          "line1": req.body.address,
          "line2": req.body.address,
          "postal_code": req.body.address,
          "state": req.body.address
        }
      }, function (err, response) {
        if (err) {
          res.render('frontend/error.ejs', {
            msg: err,
            status: false
          });
        }

        if (response.id) {
          var customer_id = response.id;
          stripe.subscriptions.create({
            'customer': customer_id,
            'items': [{
              'price': 'price_1HbTTEFbvuFDnNwpY5yQd42c'
            },],
          }, function (err, response) {
            if (err) {
              res.render('frontend/error.ejs', {
                msg: err,
                status: false
              });
            } else {
              let query = "INSERT INTO `plan_subscription` (customer_name, customer_phone, customer_email, stripe_customer_id,subscription_id,charge_id,plan_price,plan_type,customer_address) VALUES ('" + req.body.customer_name + "','" +
                req.body.customer_phone + "', '" + req.body.customer_email + "', '" + customer_id + "', '" + response.id + "',' ','" + price + "', 'mes', '" + req.body.customer_address + "') ";

              db.query(query, (err, result) => {
                if (err) {

                }
              });

              res.render('frontend/success.ejs', {
                msg: 'Obrigado pela sua confiança',
                status: true
              });
            }
          });
        }

      });
    }
  });

  app.post('/contactsave', function (req, res) {
    let query = "INSERT INTO `contactus`  (name, email, message, phone) VALUES ('" + req.body.name + "','" +
      req.body.email + "', '" + req.body.message + "', '" + req.body.phone + "') ";
    db.query(query, (err, result) => {
      if (err) {
        res.render('frontend/sucessomensagem.ejs', {
          msg: 'Ocorreu um erro!',
          status: false
        });
      }

      res.render('frontend/sucessomensagem.ejs', {
        msg: 'Obrigado pelo contato!',
        status: true
      });
    });
  });

  app.post("/create-checkout-session", async (req, res) => {

    const subscription = await stripe.subscriptions.create({
      customer: 'cus_I4m97mLuhHNeE4',
      items: [{
        price: 'price_1HOh0kKwb6M4HPsE9VIv4vdv'
      },],
    });

    console.log(subscription, 'subscription');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: "T-shirt",
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },],
      mode: "payment",
      success_url: "https://example.com/success",
      cancel_url: "https://example.com/cancel",
    });

    res.json({
      id: session.id
    });
  });

  app.get('/signup', function (req, res) {
    res.render('signup.ejs', {
      message: req.flash('signupMessage')
    });

  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  }));

  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });


};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/login');
};