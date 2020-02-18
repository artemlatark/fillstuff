import React from 'react';
import moment from 'moment';
import MomentUtils from '@date-io/moment';
import { Form } from 'formik';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { DatePicker } from '@material-ui/pickers';

import { memberRoleTransform } from 'shared/roles-access-rights';

import { weekActive, monthActive, paginationCalendarFormat } from 'src/components/Pagination/utils';
import Dropdown from 'src/components/Dropdown';

import styles from './Filter.module.css';

const FilterPositionTransform = (positionSelected, positions, loading) => {
	if (positionSelected === 'all') {
		return 'Все позиции';
	} else {
		if (loading) return <CircularProgress size={13} />;

		if (positions && positions.length) {
			const position = positions.find(position => position._id === positionSelected);

			return position ? position.name : null;
		} else {
			return 'Не найдено';
		}
	}
};

const roles = ['all', 'owners', 'admins', 'artists'];
const FilterRoleTransform = (roleSelected, members, loading) => {
	switch (roleSelected) {
		case 'all':
			return 'Все участники';
		case 'owners':
			return 'Только владельцы';
		case 'admins':
			return 'Только администраторы';
		case 'artists':
			return 'Только мастера';
		default:
			if (loading) return <CircularProgress size={13} />;

			if (members && members.length) {
				const member = members.find(member => member._id === roleSelected);

				return member ? member.user.name : null;
			} else {
				return 'Не найдено';
			}
	}
};

const DropdownFooter = props => {
	const { onResetHandler, isSubmitting, disabledSubmit } = props;

	return (
		<Grid className={styles.dropdownFooter} alignItems="center" justify="center" container>
			{typeof onResetHandler === 'function' ? (
				<Grid className={styles.dropdownFooterColumn} item>
					<Button onClick={onResetHandler} disabled={isSubmitting} size="small" variant="outlined">
						Сбросить
					</Button>
				</Grid>
			) : null}
			<Grid className={styles.dropdownFooterColumn} item>
				<Button
					type="submit"
					disabled={disabledSubmit ? isSubmitting || disabledSubmit : isSubmitting}
					size="small"
					variant="contained"
					color="primary"
				>
					Сохранить
				</Button>
			</Grid>
		</Grid>
	);
};

const FormFilter = props => {
	const {
		handlerDropdown,
		onChangeFilterDate,
		onChangeFilterPosition,
		onChangeFilterRole,
		onResetAllFilters,
		members: {
			data: members,
			isFetching: isLoadingMembers,
			// error: errorMembers
		},
		positions: {
			data: positions,
			isFetching: isLoadingPositions,
			// error: errorPositions
		},
		dropdownDate: { state: dropdownDate, ref: refDropdownDate },
		dropdownDateRange: { state: dropdownDateRange, ref: refDropdownDateRange },
		dropdownPosition: { state: dropdownPosition, ref: refDropdownPosition },
		dropdownRole: { state: dropdownRole, ref: refDropdownRole },
		formikProps: {
			// errors,
			isSubmitting,
			values,
			setFieldValue,
			submitForm,
		},
	} = props;

	const isWeekActive = currentWeek => weekActive(values.dateStartView, values.dateEndView, currentWeek);
	const isMonthActive = currentMonth => monthActive(values.dateStartView, values.dateEndView, currentMonth);

	return (
		<Form>
			<Grid container>
				{/* Filter Date */}
				<Grid item>
					<ButtonBase
						ref={refDropdownDate}
						className={styles.filterButtonLink}
						onClick={() => {
							handlerDropdown('dropdownDate');
							handlerDropdown('dropdownDateRange', false);
						}}
						disableRipple
					>
						{isWeekActive() ? (
							<span>За текущую неделю</span>
						) : isMonthActive() ? (
							<span>За текущий месяц</span>
						) : !isNaN(values.dateStartView) && !isNaN(values.dateEndView) ? (
							<span>
								{isMonthActive(false)
									? moment(values.dateStartView).calendar(null, paginationCalendarFormat(isMonthActive(false)))
									: moment(values.dateStartView).isSame(values.dateEndView, 'day')
									? moment(values.dateStartView).calendar(null, paginationCalendarFormat(false))
									: moment(values.dateStartView).calendar(null, paginationCalendarFormat(false)) +
									  ' - ' +
									  moment(values.dateEndView).calendar(null, paginationCalendarFormat(false))}
							</span>
						) : (
							'Некорректная дата'
						)}
						<FontAwesomeIcon icon={['far', 'angle-down']} />
					</ButtonBase>

					<Dropdown anchor={refDropdownDate} open={dropdownDate} onClose={() => handlerDropdown('dropdownDate')} placement="bottom-start">
						<List component="nav">
							<ListItem
								disabled={isSubmitting}
								selected={isWeekActive()}
								onClick={() => onChangeFilterDate('currentWeek', setFieldValue, submitForm)}
								component={MenuItem}
								button
							>
								За текущую неделю
							</ListItem>
							<ListItem
								disabled={isSubmitting}
								selected={isMonthActive()}
								onClick={() => onChangeFilterDate('currentMonth', setFieldValue, submitForm)}
								component={MenuItem}
								button
							>
								За текущий месяц
							</ListItem>
						</List>
						<Divider />
						<List component="nav">
							<ListItem
								ref={refDropdownDateRange}
								disabled={isSubmitting}
								onClick={() => {
									handlerDropdown('dropdownDate');
									handlerDropdown('dropdownDateRange');
								}}
								component={MenuItem}
								button
							>
								Указать период
							</ListItem>
						</List>
					</Dropdown>

					<Dropdown
						anchor={refDropdownDate}
						open={dropdownDateRange}
						onClose={() => handlerDropdown('dropdownDateRange')}
						placement="bottom-start"
					>
						<Grid className={styles.dropdownContent} alignItems="center" container>
							<MuiPickersUtilsProvider utils={MomentUtils}>
								<Grid className={styles.dropdownContentColumn} style={{ width: 'auto' }} item>
									<DatePicker
										value={values.dateStart}
										onChange={date => {
											setFieldValue('dateStart', date.valueOf(), false);

											if (moment(values.dateEnd).isBefore(date)) {
												setFieldValue('dateEnd', date.valueOf(), false);
											}
										}}
										variant="static"
										leftArrowButtonProps={{
											size: 'small',
										}}
										leftArrowIcon={<FontAwesomeIcon icon={['far', 'angle-left']} />}
										rightArrowButtonProps={{
											size: 'small',
										}}
										rightArrowIcon={<FontAwesomeIcon icon={['far', 'angle-right']} />}
										maxDate={values.dateEnd}
										disableFuture
										disableToolbar
									/>
								</Grid>
								<Grid className={styles.dropdownContentColumn} style={{ width: 'auto' }} item>
									<DatePicker
										value={values.dateEnd}
										onChange={date => {
											const dateEnd = date.set({ second: 59, millisecond: 999 });

											setFieldValue('dateEnd', dateEnd.valueOf(), false);

											if (moment(values.dateStart).isAfter(dateEnd)) {
												setFieldValue('dateStart', dateEnd.valueOf(), false);
											}
										}}
										variant="static"
										leftArrowButtonProps={{
											size: 'small',
										}}
										leftArrowIcon={<FontAwesomeIcon icon={['far', 'angle-left']} />}
										rightArrowButtonProps={{
											size: 'small',
										}}
										rightArrowIcon={<FontAwesomeIcon icon={['far', 'angle-right']} />}
										minDate={values.dateStart}
										disableFuture
										disableToolbar
									/>
								</Grid>
							</MuiPickersUtilsProvider>
						</Grid>
						<DropdownFooter isSubmitting={isSubmitting} disabledSubmit={!values.dateStart || !values.dateEnd} />
					</Dropdown>
				</Grid>

				{/* Filter Position */}
				<Grid item>
					<ButtonBase
						ref={refDropdownPosition}
						className={styles.filterButtonLink}
						onClick={() => handlerDropdown('dropdownPosition')}
						disableRipple
					>
						<span>{FilterPositionTransform(values.position, positions, isLoadingPositions)}</span>
						<FontAwesomeIcon icon={['far', 'angle-down']} />
					</ButtonBase>

					<Dropdown
						anchor={refDropdownPosition}
						open={dropdownPosition}
						onClose={() => handlerDropdown('dropdownPosition')}
						placement="bottom-start"
						innerContentStyle={{ minWidth: 125, maxHeight: 300, overflow: 'auto' }}
					>
						{!isLoadingPositions && positions && positions.length ? (
							<List component="nav">
								<ListItem
									disabled={isSubmitting}
									selected={values.position === 'all'}
									onClick={() => onChangeFilterPosition('all', setFieldValue, submitForm)}
									component={MenuItem}
									button
								>
									Все позиции
								</ListItem>
								{positions.map((position, index) => (
									<ListItem
										key={index}
										disabled={isSubmitting}
										selected={values.position === position._id}
										onClick={() => onChangeFilterPosition(position._id, setFieldValue, submitForm)}
										component={MenuItem}
										button
									>
										{position.name}{' '}
										{position.characteristics.reduce(
											(fullCharacteristics, characteristic) => `${fullCharacteristics} ${characteristic.label}`,
											''
										)}
										{position.isArchived ? <span className={styles.isArchived}>В архиве</span> : null}
									</ListItem>
								))}
							</List>
						) : (
							<div style={{ textAlign: 'center', padding: 10 }}>
								{positions && !positions.length ? (
									<Typography variant="caption">Еще не создано ни одной позиции.</Typography>
								) : (
									<CircularProgress size={20} />
								)}
							</div>
						)}
					</Dropdown>
				</Grid>

				{/* Filter Role */}
				<Grid item>
					<ButtonBase
						ref={refDropdownRole}
						className={styles.filterButtonLink}
						onClick={() => handlerDropdown('dropdownRole')}
						disableRipple
					>
						<span>{FilterRoleTransform(values.role, members, isLoadingMembers)}</span>
						<FontAwesomeIcon icon={['far', 'angle-down']} />
					</ButtonBase>

					<Dropdown
						anchor={refDropdownRole}
						open={dropdownRole}
						onClose={() => handlerDropdown('dropdownRole')}
						placement="bottom-start"
						innerContentStyle={{ maxHeight: 300, overflow: 'auto' }}
					>
						{!isLoadingMembers && members && members.length ? (
							<List component="nav">
								{roles.map((role, index) => (
									<ListItem
										key={index}
										disabled={isSubmitting}
										selected={values.role === role}
										onClick={() => onChangeFilterRole(role, setFieldValue, submitForm)}
										component={MenuItem}
										button
									>
										{FilterRoleTransform(role)}
									</ListItem>
								))}
								{members.map((member, index) => (
									<ListItem
										key={index}
										disabled={isSubmitting}
										selected={values.role === member._id}
										onClick={() => onChangeFilterRole(member._id, setFieldValue, submitForm)}
										component={MenuItem}
										button
									>
										<div className={styles.user}>
											<Avatar
												className={styles.userPhoto}
												src={member.user.avatar}
												alt={member.user.name}
												children={<div className={styles.userIcon} children={<FontAwesomeIcon icon={['fas', 'user-alt']} />} />}
											/>
											<Grid direction="column" container>
												<div className={styles.userTitle}>{member.user.name}</div>
												<div className={styles.userCaption}>{memberRoleTransform(member.roles).join(', ')}</div>
											</Grid>
										</div>
									</ListItem>
								))}
							</List>
						) : (
							<div style={{ textAlign: 'center', padding: 10 }}>
								{members && !members.length ? (
									<Typography variant="caption">В команде нет участников.</Typography>
								) : (
									<CircularProgress size={20} />
								)}
							</div>
						)}
					</Dropdown>
				</Grid>

				<Grid item style={{ marginLeft: 'auto' }}>
					{!isMonthActive() || values.position !== 'all' || values.role !== 'all' ? (
						<ButtonBase onClick={() => onResetAllFilters(setFieldValue, submitForm)} className={styles.filterButtonLinkRed} disableRipple>
							<span>Сбросить фильтры</span>
						</ButtonBase>
					) : null}
				</Grid>
			</Grid>
		</Form>
	);
};

export default FormFilter;