import { OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import { Cart as Purchases } from 'react-bootstrap-icons';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalCart, ModalOrder } from './Modals';
import { ModalContext, ScrollContext } from './Context';
import { selectors } from '../slices/cartSlice';
import { useAppSelector } from '../utilities/hooks';
import type { PriceAndCount } from '../types/Cart';

const Cart = () => {
  const { t } = useTranslation();
  const { show, modalClose, modalShow } = useContext(ModalContext);
  const { scrollBar } = useContext(ScrollContext);

  const items = useAppSelector(selectors.selectAll);
  const initialObject: PriceAndCount = { price: 0, discount: 0, count: 0 };
  const priceAndCount = items.reduce((acc, item) => {
    if (item) {
      const { price, count, discountPrice } = item;
      const currentPrice = discountPrice || price;
      const generalPrice = currentPrice * count;
      return {
        price: acc.price + generalPrice,
        discount: acc.discount + ((price - currentPrice) * count),
        count: acc.count + count,
      };
    }
    return acc;
  }, initialObject);

  return (
    <>
      <ModalCart
        items={items}
        priceAndCount={priceAndCount}
        show={show}
        onHide={modalClose}
      />
      <ModalOrder
        show={show}
        onHide={modalClose}
      />
      <OverlayTrigger
        placement="left"
        show={!!priceAndCount.count}
        overlay={(
          <Tooltip style={{ marginRight: scrollBar ? scrollBar + 1 : scrollBar }}>
            {t('cart.summ', { price: priceAndCount.price })}
          </Tooltip>
        )}
      >
        <Button className="cart" onClick={() => modalShow('cart')} style={{ marginRight: scrollBar, display: priceAndCount.count ? 'unset' : 'none' }}>
          <Purchases />
          <span className="cart__badge">{priceAndCount.count}</span>
        </Button>
      </OverlayTrigger>
    </>
  );
};

export default Cart;
