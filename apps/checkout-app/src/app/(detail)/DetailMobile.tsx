import React, { type PropsWithChildren } from 'react';
import { Arrow } from 'checkout-ui';
import clsx from 'clsx';
import { Trans } from '@lingui/react';

type Props = {
  productName?: string;
  productDetail?: string;
  setShowDetailMore: (show: boolean) => void;
}
const DetailMobile: React.FC<PropsWithChildren<Props>> = ({
                                         productName,
                                         productDetail,
                                         setShowDetailMore,
  children
                                       }) => {
  return (
    <>
      {/** 📱移动端📱 标题详情 */}
      <div className={'sm:hidden mt-px'}>
        {(productName || productDetail) && <>
          <div className="mb-3 bg-white sm:hidden text-center">
            <p className="text-sm px-10 w-[calc(100%-32px)] line-clamp-2 mx-auto break-words">
              {productName}
            </p>
          </div>
        </>
        }
        <div
          className="space-x-3 sm:items-center marker-none sm:flex-wrap align-top">
          <div className="flex items-center justify-center">
            {children}
          </div>
        </div>
        <div
          className={clsx('mx-auto rounded-lg border-[1.5px] border-[#1A1919] w-fit my-6 py-2.5 px-5 text-sm',
            'font-medium flex justify-center items-center cursor-pointer gap-x-2')}
          onClick={() => setShowDetailMore(true)}
        >
          <Trans id={'amount.viewDetails'} message='View Details' />
          {' '}<Arrow direction={"down"} className={'inline-block'}/>
        </div>
      </div>
    </>
  );
};

export default DetailMobile;
