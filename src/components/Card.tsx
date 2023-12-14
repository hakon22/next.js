import { Card as CardBootstrap, Button } from 'react-bootstrap';
import { PlusCircle, DashCircle } from 'react-bootstrap-icons';
import { useState, useEffect } from 'react';
import { Rate, Tooltip, Skeleton } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  cartAdd, cartUpdate, cartRemove, selectors,
} from '../slices/cartSlice';
import { useAppDispatch, useAppSelector } from '../utilities/hooks';
import fetchImage from '../utilities/fetchImage';
import type { CardItemProps } from '../types/Item';

const Card = ({ item }: CardItemProps) => {
  const {
    id, name, image, unit, price, discount, discountPrice,
  } = item;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [srcImage, setSrcImage] = useState('');
  const [onLoad, setOnLoad] = useState(false);
  const countInCart = useAppSelector((state) => selectors.selectById(state, id))?.count;

  const setCount = (itemId: number, count: number) => (count < 1
    ? dispatch(cartRemove(itemId))
    : dispatch(cartUpdate({ id: itemId, changes: { count } })));

  useEffect(() => {
    fetchImage(image, setSrcImage);
  }, []);

  useEffect(() => {
    if (srcImage) {
      setOnLoad(true);
    }
  }, [srcImage]);

  return (
    <CardBootstrap className="card-item">
      <div className="card-image mx-auto">
        {onLoad ? <CardBootstrap.Img variant="top" src={srcImage} alt={name} /> : <Skeleton.Image active className="w-100" />}
      </div>
      <CardBootstrap.Body className="pt-0">
        <Rate disabled defaultValue={4.5} />
        <div className="d-flex justify-content-between align-items-center gap-1 mb-3  min-height-55">
          <Tooltip title={name} color="orange">
            <CardBootstrap.Title className="truncate">{name}</CardBootstrap.Title>
          </Tooltip>
          <CardBootstrap.Subtitle className="text-muted">
            {t('cardItem.subtitle', { price: discountPrice || price, unit })}
          </CardBootstrap.Subtitle>
        </div>
        <CardBootstrap.Text as="div" className="fs-bold mb-3">
          {discount
            ? (
              <div className="d-flex gap-1 price d-flex align-items-center justify-content-between">
                <span className="fs-6 text-muted discount">{t('cardItem.price', { price })}</span>
                <span className="fs-4 text-danger">{t('cardItem.price', { price: discountPrice })}</span>
              </div>
            )
            : <span className="fs-4">{t('cardItem.price', { price })}</span>}
        </CardBootstrap.Text>
        <div className="d-flex justify-content-center min-height-38">
          {countInCart
            ? (
              <div className="d-flex justify-content-center align-items-center gap-4">
                <DashCircle
                  className="fs-3 text-success icon-hover animate__animated animate__fadeInLeft"
                  role="button"
                  onClick={() => {
                    setCount(id, countInCart - 1);
                  }}
                />
                <span className="fs-5">{countInCart}</span>
                <PlusCircle
                  className="fs-3 text-success icon-hover animate__animated animate__fadeInRight"
                  role="button"
                  onClick={() => {
                    setCount(id, countInCart + 1);
                  }}
                />
              </div>
            )
            : (
              <Button
                variant="success"
                onClick={() => {
                  dispatch(cartAdd({
                    id, name, price, discountPrice, discount, image: srcImage, unit, count: 1,
                  }));
                }}
              >
                {t('cardItem.addToCart')}
              </Button>
            ) }
        </div>
      </CardBootstrap.Body>
    </CardBootstrap>
  );
};

export default Card;
