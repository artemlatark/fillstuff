import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';

import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import * as Yup from 'yup';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';

import { checkPermissions, findMemberInStock } from 'shared/roles-access-rights';

import CardPaper from 'src/components/CardPaper';
import { PDDialogActions, PDDialogTitle } from 'src/components/Dialog';

import { createCategory, editCategory, deleteCategory } from 'src/actions/stocks';

import './Categories.styl';

const createEditCategorySchema = Yup.object().shape({
	name: Yup.string()
		// eslint-disable-next-line
		.min(2, 'Название категории не может быть короче ${min} символов')
		// eslint-disable-next-line
		.max(50, 'Название категории не может превышать ${max} символов')
		.required('Обязательное поле'),
});

class Categories extends Component {
	state = {
		categoryActionsMenuOpen: null,
		selectedCategory: null,
		dialogCreateEditActionType: null,
		dialogCreateEditCategory: false,
		dialogDeleteCategory: false,
	};

	onOpenCategoryActionsMenu = (event, category) =>
		this.setState({
			categoryActionsMenuOpen: event.currentTarget,
			selectedCategory: category,
		});

	onCloseCategoryActionsMenu = saveCategory => {
		if (!saveCategory) {
			this.setState({
				categoryActionsMenuOpen: null,
				selectedCategory: null,
			});
		} else {
			this.setState({ categoryActionsMenuOpen: null });
		}
	};

	onOpenDialogCreateEditCategory = actionType =>
		this.setState({
			dialogCreateEditActionType: actionType,
			dialogCreateEditCategory: true,
		});

	onCloseDialogCreateEditCategory = () =>
		this.setState({
			dialogCreateEditCategory: false,
		});

	onExitedDialogCreateEditCategory = () =>
		this.setState({
			dialogCreateEditActionType: null,
			selectedCategory: null,
		});

	onOpenDialogDeleteCategory = () => {
		this.setState({
			dialogDeleteCategory: true,
		});
	};

	onCloseDialogDeleteCategory = () =>
		this.setState({
			dialogDeleteCategory: false,
		});

	onExitedDialogDeleteCategory = () =>
		this.setState({
			selectedCategory: null,
		});

	render() {
		const {
			currentUser,
			currentStock,
			currentUserRole = findMemberInStock(currentUser._id, currentStock).role,
			categories = currentStock.categories,
		} = this.props;

		const {
			categoryActionsMenuOpen,
			selectedCategory,
			dialogCreateEditActionType,
			dialogCreateEditCategory,
			dialogDeleteCategory,
		} = this.state;

		return (
			<CardPaper
				elevation={1}
				leftContent="Категории"
				rightContent={
					checkPermissions(currentUserRole, ['products.control']) ? (
						<IconButton
							className="sa-categories__add-category"
							variant="outlined"
							color="primary"
							onClick={() => this.onOpenDialogCreateEditCategory('create')}
							size="small"
						>
							<FontAwesomeIcon icon={['far', 'plus']} />
						</IconButton>
					) : null
				}
				title
			>
				{categories.length ? (
					<div className="sa-categories__list">
						{categories.map((category, index) => (
							<div className="sa-categories__item" key={category._id}>
								<NavLink
									className="sa-categories__link"
									activeClassName="sa-categories__link_active"
									to={`/stocks/${currentUser.activeStockId}/categories/${category._id}`}
								>
									<div className="sa-categories__name">{category.name}</div>
								</NavLink>
								{checkPermissions(currentUserRole, ['products.control']) ? (
									<IconButton
										className="sa-categories__actions"
										aria-haspopup="true"
										onClick={event => this.onOpenCategoryActionsMenu(event, category)}
										size="small"
									>
										<FontAwesomeIcon icon={['far', 'ellipsis-h']} />
									</IconButton>
								) : null}
							</div>
						))}
					</div>
				) : (
					<Typography variant="caption" align="center" component="div">
						Еще не создано ни одной категории
					</Typography>
				)}

				<Popover
					anchorEl={categoryActionsMenuOpen}
					open={Boolean(categoryActionsMenuOpen)}
					onClose={this.onCloseCategoryActionsMenu}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'center',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'center',
					}}
					transitionDuration={150}
					elevation={2}
				>
					<MenuList>
						<MenuItem
							onClick={() => {
								this.onOpenDialogCreateEditCategory('edit');
								this.onCloseCategoryActionsMenu(true);
							}}
						>
							Редактировать
						</MenuItem>
						<MenuItem
							onClick={() => {
								this.onOpenDialogDeleteCategory();
								this.onCloseCategoryActionsMenu(true);
							}}
						>
							Удалить
						</MenuItem>
					</MenuList>
				</Popover>

				<Dialog
					open={dialogCreateEditCategory}
					onClose={this.onCloseDialogCreateEditCategory}
					onExited={this.onExitedDialogCreateEditCategory}
					fullWidth
				>
					<PDDialogTitle theme="primary" onClose={this.onCloseDialogCreateEditCategory}>
						{dialogCreateEditActionType === 'create' ? 'Добавление категории' : 'Редактирование категории'}
					</PDDialogTitle>
					<Formik
						initialValues={dialogCreateEditActionType === 'create' ? { name: '' } : selectedCategory}
						validationSchema={createEditCategorySchema}
						validateOnBlur={false}
						validateOnChange={false}
						onSubmit={(values, actions) => {
							switch (dialogCreateEditActionType) {
								case 'create':
									return this.props.createCategory(values).then(response => {
										if (response.status === 'success') this.onCloseDialogCreateEditCategory();
										else actions.setSubmitting(false);
									});
								case 'edit':
									return this.props.editCategory(selectedCategory._id, values).then(response => {
										if (response.status === 'success') this.onCloseDialogCreateEditCategory();
										else actions.setSubmitting(false);
									});
								default:
									return;
							}
						}}
						render={({ errors, touched, isSubmitting, values }) => (
							<Form>
								<DialogContent>
									<Grid>
										<Field
											name="name"
											label="Название категории"
											component={TextField}
											InputLabelProps={{
												shrink: true,
											}}
											autoComplete="off"
											autoFocus
											fullWidth
										/>
									</Grid>
								</DialogContent>
								<PDDialogActions
									leftHandleProps={{
										handleProps: {
											onClick: this.onCloseDialogCreateEditCategory,
										},
										text: 'Закрыть',
									}}
									rightHandleProps={{
										handleProps: {
											type: 'submit',
											disabled: isSubmitting,
										},
										text: isSubmitting ? (
											<CircularProgress size={20} />
										) : dialogCreateEditActionType === 'create' ? (
											'Добавить'
										) : (
											'Сохранить'
										),
									}}
								/>
							</Form>
						)}
					/>
				</Dialog>

				<Dialog
					open={dialogDeleteCategory}
					onClose={this.onCloseDialogDeleteCategory}
					onExited={this.onExitedDialogDeleteCategory}
					fullWidth
				>
					<PDDialogTitle theme="primary" onClose={this.onCloseDialogDeleteCategory}>
						Удаление категории
					</PDDialogTitle>
					<DialogContent>
						{selectedCategory ? (
							<DialogContentText>
								Вы уверены, что хотите удалить категорию <b>{selectedCategory.name}</b> из списка?
							</DialogContentText>
						) : null}
					</DialogContent>
					<PDDialogActions
						leftHandleProps={{
							handleProps: {
								onClick: this.onCloseDialogDeleteCategory,
							},
							text: 'Закрыть',
						}}
						rightHandleProps={{
							handleProps: {
								onClick: () => {
									this.props.deleteCategory(selectedCategory._id).then(() => {
										this.onCloseDialogDeleteCategory();
										// history.push({ pathname: changeStockCurrentUrl(currentStock._id) });
									});
								},
							},
							text: 'Удалить',
						}}
					/>
				</Dialog>
			</CardPaper>
		);
	}
}

const mapDispatchToProps = (dispatch, ownProps) => {
	const { currentStock } = ownProps;

	return {
		createCategory: values => dispatch(createCategory(currentStock._id, values)),
		editCategory: (categoryId, newValues) => dispatch(editCategory(currentStock._id, categoryId, newValues)),
		deleteCategory: categoryId => dispatch(deleteCategory(currentStock._id, categoryId)),
	};
};

export default connect(
	null,
	mapDispatchToProps
)(Categories);
