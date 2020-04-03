import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import loadable from '@loadable/component';

import generateMetaInfo from 'shared/generate-meta-info';

import { history } from 'src/helpers/history';

import Head from 'src/components/head';
import HeaderPage from 'src/components/HeaderPage';
import { LoadingComponent } from 'src/components/Loading';
import { withCurrentUser } from 'src/components/withCurrentUser';

import { getCharacteristics } from 'src/actions/characteristics';
import { getPosition, archivePositionAfterEnded } from 'src/actions/positions';
import { getReceiptsPosition, changeReceipt } from 'src/actions/receipts';
import { enqueueSnackbar } from 'src/actions/snackbars';

import stylesPage from 'src/styles/page.module.css';
import styles from './index.module.css';

const Index = loadable(() => import('./components/index' /* webpackChunkName: "Position_Index" */), {
	fallback: <LoadingComponent />,
});

class Position extends Component {
	state = {
		positionData: null,
		receiptsData: null,
	};

	getPosition = () => {
		this.props.getPosition().then(response => {
			if (response.status === 'success') {
				this.setState({
					positionData: response,
				});
			} else {
				history.push({
					pathname: '/availability',
				});
			}
		});
	};

	onCancelArchivePositionAfterEnded = positionId => {
		this.props.archivePositionAfterEnded(positionId, { archivedAfterEnded: false }).then(response => {
			this.setState({
				positionData: response,
			});
		});
	};

	getReceipts = () => {
		this.props.getReceiptsPosition().then(response => {
			this.setState({ receiptsData: response });
		});
	};

	onReceiptCreate = response => {
		if (response.status === 'success') {
			const { data: newReceipt } = response;

			const newReceiptsData = {
				status: 'success',
				data: this.state.receiptsData.data.slice(),
			};

			newReceiptsData.data.unshift(newReceipt);

			this.setState({ receiptsData: newReceiptsData });
		}
	};

	onChangeSellingPriceReceipt = (receiptId, values, callback) => {
		this.props.changeReceipt({ receiptId }, values).then(response => {
			callback();

			if (response.status === 'success') {
				const { data: receiptEdited } = response;

				const newReceiptsData = {
					status: 'success',
					data: this.state.receiptsData.data.slice().map(receipt => {
						if (receipt._id === receiptEdited._id) {
							return receiptEdited;
						} else {
							return receipt;
						}
					}),
				};

				this.setState({ receiptsData: newReceiptsData });
			}

			if (response.status === 'error') {
				this.props.enqueueSnackbar({
					message: response.message || 'Неизвестная ошибка.',
					options: {
						variant: 'error',
					},
				});
			}
		});
	};

	componentDidMount() {
		this.getPosition();

		this.props.getReceiptsPosition().then(response => {
			this.setState({ receiptsData: response });
		});
	}

	render() {
		const { currentStudio, getCharacteristics } = this.props;
		const { positionData, receiptsData } = this.state;

		const metaInfo = {
			pageName: 'position',
			pageTitle: 'Детали позиции',
		};

		if (positionData && positionData.data && positionData.data.name) {
			metaInfo.pageTitle = positionData.data.name;
		}

		const { title, description } = generateMetaInfo({
			type: metaInfo.pageName,
			data: {
				title: metaInfo.pageTitle,
			},
		});

		const pageParams = {
			backToPage: '/availability',
		};

		return (
			<div className={stylesPage.page}>
				<Head title={title} description={description} />

				<HeaderPage pageName={metaInfo.pageName} pageTitle="В наличии" pageParams={pageParams} />
				<div className={`${stylesPage.pageContent} ${styles.container}`}>
					<Index
						currentStudio={currentStudio}
						positionData={positionData}
						receiptsData={receiptsData}
						getCharacteristics={() => getCharacteristics(currentStudio._id)}
						getPosition={this.getPosition}
						onCancelArchivePositionAfterEnded={this.onCancelArchivePositionAfterEnded}
						onReceiptCreate={this.onReceiptCreate}
						onChangeSellingPriceReceipt={this.onChangeSellingPriceReceipt}
					/>
				</div>
			</div>
		);
	}
}

const mapDispatchToProps = (dispatch, ownProps) => {
	const {
		match: {
			params: { positionId },
		},
	} = ownProps;

	return {
		getCharacteristics: currentStudioId => dispatch(getCharacteristics(currentStudioId)),
		getPosition: () => dispatch(getPosition({ params: { positionId } })),
		archivePositionAfterEnded: (positionId, data) => dispatch(archivePositionAfterEnded({ params: { positionId }, data })),
		getReceiptsPosition: () => dispatch(getReceiptsPosition({ params: { positionId } })),
		changeReceipt: (params, data) => dispatch(changeReceipt({ params, data })),
		enqueueSnackbar: (...args) => dispatch(enqueueSnackbar(...args)),
	};
};

export default compose(connect(null, mapDispatchToProps), withCurrentUser)(Position);
