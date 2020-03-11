import React, { useState, useRef } from 'react';
import ClassNames from 'classnames';

import { Form, Field, FieldArray } from 'formik';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CircularProgress from '@material-ui/core/CircularProgress';
import DialogContent from '@material-ui/core/DialogContent';
import ButtonBase from '@material-ui/core/ButtonBase';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';

import { DialogActions } from 'src/components/Dialog';
import NumberFormat from 'src/components/NumberFormat';
import Chips from 'src/components/Chips';
import PositionNameInList from 'src/components/PositionNameInList';

import { SearchTextField } from './styles';
import stylesGlobal from 'src/styles/globals.module.css';
import styles from './index.module.css';

const selectPositionsClasses = (selectedPositions, positionId) => {
	return ClassNames({
		[styles.selectPosition]: true,
		[styles.selectPositionSelected]: selectedPositions.some(selectedPosition => selectedPosition._id === positionId),
	});
};

const findPositionByFullName = (position, searchText) => {
	if (position.positionGroup) return false;

	const searchTextLowercase = String(searchText).toLowerCase();

	const positionName = position.characteristics
		.reduce((fullName, characteristic) => `${fullName} ${characteristic.label}`, position.name)
		.toLowerCase();

	return positionName.indexOf(searchTextLowercase) !== -1;
};

const FormPositionGroupCreateEditAdd = props => {
	const {
		onCloseDialog,
		type,
		positions: {
			data: allPositions,
			isFetching: isLoadingAllPositions,
			// error: errorPositions
		},
		formikProps: { errors, isSubmitting, touched, values, setFieldValue },
	} = props;
	const searchTextFieldPosition = useRef(null);
	const [searchTextPosition, setSearchTextPosition] = useState('');

	const onTypeSearchTextPosition = ({ target: { value } }) => setSearchTextPosition(value);
	const onClearSearchTextPosition = () => {
		setSearchTextPosition('');

		searchTextFieldPosition.current.focus();
	};

	const positions =
		!isLoadingAllPositions && allPositions ? allPositions.filter(position => findPositionByFullName(position, searchTextPosition)) : [];

	return (
		<Form>
			<DialogContent style={{ overflow: 'initial' }}>
				{type === 'create' || type === 'edit' ? (
					<div>
						<Grid className={stylesGlobal.formLabelControl} wrap="nowrap" alignItems="flex-start" container>
							<InputLabel error={Boolean(touched.name && errors.name)} style={{ minWidth: 126 }}>
								Название
							</InputLabel>
							<Field
								name="name"
								error={Boolean(touched.name && errors.name)}
								helperText={(touched.name && errors.name) || ''}
								as={TextField}
								inputProps={{
									maxLength: 60,
								}}
								autoFocus
								fullWidth
							/>
						</Grid>

						<Grid className={stylesGlobal.formLabelControl} wrap="nowrap" alignItems="flex-start" container>
							<InputLabel
								error={
									Boolean(touched.dividedPositions && errors.dividedPositions) || Boolean(touched.minimumBalance && errors.minimumBalance)
								}
								style={{ width: 126 }}
							>
								Минимальный остаток
								<Tooltip title={<div style={{ maxWidth: 200 }}>текст который ничем не может помочь</div>} placement="bottom">
									<div className={styles.helpIcon}>
										<FontAwesomeIcon icon={['fal', 'question-circle']} fixedWidth />
									</div>
								</Tooltip>
							</InputLabel>
							<Grid>
								<Grid className={stylesGlobal.formLabelControl} alignItems="center" container>
									<ToggleButtonGroup
										value={values.dividedPositions}
										onChange={(event, value) => {
											if (value === null) return;

											setFieldValue('dividedPositions', value);
										}}
										size="small"
										exclusive
									>
										<ToggleButton value={false}>Общий для группы</ToggleButton>
										<ToggleButton value={true}>Раздельный по позициям</ToggleButton>
									</ToggleButtonGroup>
								</Grid>

								{!values.dividedPositions && values.dividedPositions !== '' ? (
									<FormControl>
										<Field
											name="minimumBalance"
											placeholder="0"
											error={Boolean(touched.minimumBalance && errors.minimumBalance)}
											helperText={(touched.minimumBalance && errors.minimumBalance) || ''}
											as={TextField}
											InputProps={{
												inputComponent: NumberFormat,
												inputProps: {
													allowNegative: false,
												},
											}}
											style={{ width: 130 }}
										/>
									</FormControl>
								) : null}
							</Grid>
						</Grid>
					</div>
				) : null}

				{type === 'create' || type === 'add' ? (
					<Grid className={styles.selectPositions} direction="column" wrap="nowrap" container>
						<InputLabel error={typeof errors.positions === 'string'}>
							{typeof errors.positions === 'string' ? errors.positions : 'Выберите позиции'}
						</InputLabel>
						<div className={styles.searchTextFieldContainer}>
							<SearchTextField
								inputRef={searchTextFieldPosition}
								placeholder="Введите название позиции"
								value={searchTextPosition}
								onChange={onTypeSearchTextPosition}
								fullWidth
							/>
							{searchTextPosition ? (
								<ButtonBase onClick={onClearSearchTextPosition} className={styles.searchTextFieldClear}>
									<FontAwesomeIcon icon={['fal', 'times']} />
								</ButtonBase>
							) : null}
						</div>
						<FieldArray
							name="positions"
							validateOnChange={false}
							render={arrayHelpers => (
								<div className={styles.selectPositionsWrap}>
									{!isLoadingAllPositions ? (
										positions.length ? (
											positions.map((position, index) => (
												<div
													key={index}
													className={selectPositionsClasses(values.positions, position._id)}
													onClick={() => {
														const selectedPositionIndex = values.positions.findIndex(
															selectedPosition => selectedPosition._id === position._id
														);

														searchTextFieldPosition.current.focus();

														if (!!~selectedPositionIndex) return arrayHelpers.remove(selectedPositionIndex);
														else return arrayHelpers.push(position);
													}}
												>
													<div className={styles.selectPositionCheckbox}>
														<FontAwesomeIcon icon={['far', 'check']} />
													</div>
													<PositionNameInList
														className={styles.positionName}
														name={position.name}
														characteristics={position.characteristics}
													/>
												</div>
											))
										) : !positions.length && searchTextPosition ? (
											<Typography variant="caption" align="center" display="block" style={{ marginTop: 20 }}>
												Ничего не найдено
											</Typography>
										) : (
											<Typography variant="caption" align="center" display="block" style={{ marginTop: 20 }}>
												Нет позиций для группировки
											</Typography>
										)
									) : (
										<div children={<CircularProgress size={20} />} style={{ marginTop: 20, textAlign: 'center' }} />
									)}
									{values.positions.length ? (
										<Chips
											className={styles.selectedPositions}
											chips={values.positions}
											onRenderChipLabel={position => (
												<span>
													{position.characteristics.reduce(
														(fullCharacteristics, characteristic) => `${fullCharacteristics} ${characteristic.label}`,
														position.name
													)}
												</span>
											)}
											onRemoveChip={(chips, index) => arrayHelpers.remove(index)}
										/>
									) : null}
								</div>
							)}
						/>
					</Grid>
				) : null}
			</DialogContent>
			<DialogActions
				leftHandleProps={{
					handleProps: {
						onClick: onCloseDialog,
					},
					text: 'Отмена',
				}}
				rightHandleProps={{
					handleProps: {
						type: 'submit',
						disabled: isSubmitting,
					},
					text: type === 'create' ? 'Создать' : type === 'edit' ? 'Сохранить' : 'Добавить',
					isLoading: isSubmitting,
				}}
			/>
		</Form>
	);
};

export default FormPositionGroupCreateEditAdd;
