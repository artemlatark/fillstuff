import React, { useState, useEffect } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';
import moment from 'moment';

import Layout from 'src/components/Layout';
import HeaderPage from 'src/components/HeaderPage';
import { checkQueryInFilter, deleteParamsCoincidence } from 'src/components/Pagination/utils';
import { withCurrentUser } from 'src/components/withCurrentUser';

import { getInvoices } from 'src/actions/invoices';

import stylesPage from 'src/styles/page.module.css';
import styles from './index.module.css';

import Index from './containers/index';

const Invoices = props => {
	const { invoices } = props;
	const [page, setPage] = useState(1);

	const layoutMetaInfo = {
		pageName: 'invoices',
		pageTitle: 'Счета',
	};

	const filterOptions = {
		params: checkQueryInFilter({
			page: 1,
			limit: 10,
			dateStart: null,
			dateEnd: null,
			status: 'all',
			member: 'all',
		}),
		delete: {
			searchByName: ['page', 'limit'],
			searchByValue: [null, '', 'all'],
			serverQueryByValue: [null, '', 'all'],
		},
	};

	useEffect(() => {
		const { params: filterParams, delete: filterDeleteParams } = filterOptions;

		const query = deleteParamsCoincidence({ ...filterParams }, { type: 'server', ...filterDeleteParams });

		props.getInvoices(query, { emptyData: true });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Layout metaInfo={layoutMetaInfo}>
			<HeaderPage pageName={layoutMetaInfo.pageName} pageTitle={layoutMetaInfo.pageTitle} />
			<div className={`${stylesPage.pageContent} ${styles.container}`}>
				<Index
					invoices={invoices}
					filterOptions={filterOptions}
					paging={{
						page,
						setPage,
					}}
				/>
			</div>
		</Layout>
	);
};

const mapStateToProps = state => {
	const {
		invoices: {
			data: invoicesData,
			isFetching: isLoadingInvoices,
			// error: errorPositions
		},
	} = state;

	const invoices = {
		data: null,
		isFetching: isLoadingInvoices,
	};

	if (invoicesData) {
		// Группируем счета по дням
		const invoicesDays = _.chain(invoicesData.data)
			.groupBy(invoice => {
				return moment(invoice.createdAt)
					.set({
						hour: 0,
						minute: 0,
						second: 0,
						millisecond: 0,
					})
					.format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
			})
			.map((invoices, date) => {
				invoices.forEach(invoice => {
					invoice.positions.sort((a, b) => a.position.name.localeCompare(b.position.name) || +b.sellingPrice - +a.sellingPrice);
					if (invoice.payments.length) invoice.payments.reverse();
				});

				return { date, invoices };
			})
			.value();

		invoices.data = {
			data: invoicesDays,
			paging: invoicesData.paging,
		};
	}

	return {
		invoices: invoices,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		getInvoices: (query, options) => dispatch(getInvoices({ query, ...options })),
	};
};

export default compose(connect(mapStateToProps, mapDispatchToProps), withCurrentUser)(Invoices);
