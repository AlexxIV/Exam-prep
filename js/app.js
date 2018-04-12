$(() => {
    const app = Sammy('#container', function () {
       this.use('Handlebars', 'hbs');

       this.get('#/home', getWelcomePage);
       this.get('index.html', getWelcomePage);

       this.post('#/register', (ctx) => {
           let username = ctx.params.username;
           let password = ctx.params.password;
           let repeatPass = ctx.params.repeatPass;

           if (!/^[A-Za-z]{3,}$/.test(username)) {
               notify.showError('Username should be at least 3 characters long and contain only english alphabet letters.');
           } else if (!/^[A-Za-z\d]{6,}$/.test(password)) {
               notify.showError('Password should be at least 6 characters long and contain only english alphabet letters and digits.');
           } else if (repeatPass !== password) {
               notify.showError('Passwords must match!');
           } else {
               auth.register(username, password)
                   .then((userData) => {
                       auth.saveSession(userData);
                       notify.showInfo('User registration successful!');
                       ctx.redirect('#/catalog');
                   })
                   .catch(notify.handleError);
           }
       });
       this.post('#/login', (ctx) => {
           let username = ctx.params.username;
           let password = ctx.params.password;

           if (username === '' || password === '') {
               notify.showError('All fields should be non-empty!');
           } else {
               auth.login(username, password)
                   .then((userData) => {
                       auth.saveSession(userData);
                       notify.showInfo('Login successful.');
                       ctx.redirect('#/catalog');
                   })
                   .catch(notify.handleError);
           }
       });
       this.get('#/logout', (ctx) => {
          auth.logout()
              .then(() => {
                  sessionStorage.clear();
                  ctx.redirect('#/home');
              })
              .catch(notify.handleError);
       });

       function getWelcomePage(ctx) {
            if (!auth.isAuth()) {
                ctx.loadPartials({
                    header: './templates/common/header.hbs',
                    footer: './templates/common/footer.hbs',
                    loginForm: './templates/forms/loginForm.hbs',
                    registerForm: './templates/forms/registerForm.hbs'
                }).then(function () {
                    this.partial('./templates/welcome-anonymous.hbs');
                })
            } else {
                ctx.redirect('#/catalog');
            }
        }
    });

    app.run();
});