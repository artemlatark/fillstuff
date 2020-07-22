import React, { Fragment, useState } from 'react';
import { Field } from 'formik';
import validator from 'validator';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

import { formError, formErrorHelperText } from 'src/helpers/utils';

import Tooltip from 'src/components/Tooltip';

import styles from './ShopItem.module.css';

const ShopItem = props => {
	const {
		index,
		shop,
		formikProps: { errors, setFieldValue, validateField, setFieldTouched, touched },
		arrayHelpers,
	} = props;
	const [toggleVisibleForm, setToggleVisibleForm] = useState(false);
	const [oldShopInfo, setOldShopInfo] = useState({
		link: shop.link,
		comment: shop.comment,
	});

	const onToggleVisibleForm = value => {
		setToggleVisibleForm(value);

		if (value) {
			setOldShopInfo({
				link: shop.link,
				comment: shop.comment,
			});
		}
	};

	const resetChanges = () => {
		if (shop.link !== oldShopInfo.link || shop.comment !== oldShopInfo.comment) {
			setFieldValue(`shops.${index}.link`, oldShopInfo.link);
			setFieldValue(`shops.${index}.comment`, oldShopInfo.comment);
		}

		setFieldTouched(`shops.${index}.link`, false);
		setFieldTouched(`shops.${index}.comment`, false);

		onToggleVisibleForm(false);
	};

	const saveChanges = async () => {
		const errorLink = await validateField(`shops.${index}.link`);

		if (!errorLink) {
			setFieldTouched(`shops.${index}.link`, false);
			setFieldTouched(`shops.${index}.comment`, false);

			onToggleVisibleForm(false);
		}
	};

	const link = shop.link || shop.shop.link;

	return (
		<div className={styles.container}>
			<Grid alignItems="flex-start" spacing={2} container>
				<Grid xs={6} item>
					<Grid alignItems="flex-start" container>
						<Grid xs={toggleVisibleForm ? 5 : 12} item>
							<Typography className={styles.shopName} variant="body2">
								{link ? (
									<a
										// eslint-disable-next-line
										href={!~link.search(/^http[s]?\:\/\//) ? `//${link}` : `${link}`}
										target="_blank"
										rel="noreferrer noopener"
									>
										{shop.shop.name}
									</a>
								) : (
									<Fragment>{shop.shop.name}</Fragment>
								)}
							</Typography>
						</Grid>
						{toggleVisibleForm ? (
							<Grid xs={7} item>
								<Field
									name={`shops.${index}.link`}
									error={formError(touched, errors, `shops.${index}.link`)}
									helperText={formErrorHelperText(touched, errors, `shops.${index}.link`, null)}
									placeholder="Ссылка на товар"
									as={TextField}
									validate={value => {
										if (value !== '' && !validator.isURL(value)) return 'Некорректная ссылка';
									}}
									fullWidth
								/>
							</Grid>
						) : null}
					</Grid>
				</Grid>
				<Grid style={{ flex: '1 1' }} item>
					{!toggleVisibleForm ? (
						<Typography className={styles.shopComment} variant="body2">
							{shop.comment}
						</Typography>
					) : (
						<Field
							name={`shops.${index}.comment`}
							error={formError(touched, errors, `shops.${index}.comment`)}
							as={TextField}
							placeholder="Информация о скидке на позицию, номер менеджера, любая полезная информация"
							rows={1}
							rowsMax={4}
							multiline
							fullWidth
						/>
					)}
				</Grid>
				<Grid item>
					<Grid className={styles.actions} justify="flex-end" container>
						{!toggleVisibleForm ? (
							<Fragment>
								{!shop.numberReceipts ? (
									<Tooltip title="Удалить" placement="top" style={{ marginRight: 8 }}>
										<IconButton type="button" onClick={() => arrayHelpers.remove(index)} className={styles.actionButton}>
											<FontAwesomeIcon icon={['far', 'trash']} />
										</IconButton>
									</Tooltip>
								) : null}
								<Tooltip title="Изменить" placement="top">
									<IconButton type="button" onClick={() => onToggleVisibleForm(true)} className={styles.actionButton}>
										<FontAwesomeIcon icon={['far', 'pen']} />
									</IconButton>
								</Tooltip>
							</Fragment>
						) : (
							<Fragment>
								<Tooltip title="Отменить" placement="top" style={{ marginRight: 8 }}>
									<IconButton onClick={() => resetChanges()} className={styles.actionButton}>
										<FontAwesomeIcon icon={['far', 'times']} />
									</IconButton>
								</Tooltip>
								<Tooltip title="Сохранить" placement="top">
									<IconButton type="submit" onClick={() => saveChanges()} className={styles.actionButton}>
										<FontAwesomeIcon icon={['far', 'check']} />
									</IconButton>
								</Tooltip>
							</Fragment>
						)}
					</Grid>
				</Grid>
			</Grid>
		</div>
	);
};

export default ShopItem;
