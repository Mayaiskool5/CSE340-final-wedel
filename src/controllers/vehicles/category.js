import * as catModel from '../../models/vehicles/category.js';

const showCategoryManager = async (req, res, next) => {
    try {
        const categories = await catModel.getAllCategories();
        res.render('admin/categories', { title: 'Manage Categories', categories });
    } catch (error) { next(error); }
};

const processAddCategory = async (req, res, next) => {
    try {
        await catModel.createCategory(req.body.name);
        req.flash('success', 'Category added.');
        res.redirect('/admin/categories');
    } catch (error) { next(error); }
};

const processDeleteCategory = async (req, res, next) => {
    try {
        await catModel.deleteCategory(req.params.id);
        req.flash('success', 'Category removed.');
        res.redirect('/admin/categories');
    } catch (error) { next(error); }
};

export {
    showCategoryManager,
    processAddCategory,
    processDeleteCategory
}