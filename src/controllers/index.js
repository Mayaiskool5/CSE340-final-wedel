// Route handlers for static pages
const homePage = (req, res) => {

    const featuredVehicles = []; 

    res.render('home', { 
        title: 'Home', 
        featuredVehicles 
    });
};

export { homePage };