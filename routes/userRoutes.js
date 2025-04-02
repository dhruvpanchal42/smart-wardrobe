// Google OAuth routes
router.get('/auth/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
);

router.get('/auth/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/',
        failureFlash: true
    }),
    (req, res) => {
        // Successful authentication, redirect to intro
        res.redirect('/intro');
    }
); 