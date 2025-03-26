import AmericanExpress from "./svg32x22/American Express.svg";
import ApplePay from "./svg32x22/ApplePay.svg";
import BANCOMATPay from "./svg32x22/BANCOMAT Pay.svg";
import BLIKOneClick from "./svg32x22/BLIK OneClick.svg";
import BLIK from "./svg32x22/BLIK.svg";
import BitPay from "./svg32x22/BitPay.svg";
import CashAppPay from "./svg32x22/Cash App Pay.svg";
import DuitNow from "./svg32x22/DuitNow.svg";
import EPS from "./svg32x22/EPS.svg";
import FPXOnlineBanking from "./svg32x22/FPX Online Banking.svg";
import FinlandBanks from "./svg32x22/Finland Banks.svg";
import Giropay from "./svg32x22/Giropay.svg";
import GoPay from "./svg32x22/GoPay.svg";
import GooglePay from "./svg32x22/GooglePay.svg";
import IndonesiaBanks from "./svg32x22/Indonesia Banks.svg";
import JCB from "./svg32x22/JCB.svg";
import Konbini from "./svg32x22/Konbini.svg";
import KoreanDomesticCards from "./svg32x22/Korean Domestic cards.svg";
import MBbank from "./svg32x22/MBbank.svg";
import Mastercard from "./svg32x22/Mastercard.svg";
import MyBank from "./svg32x22/MyBank.svg";
import OXXO from "./svg32x22/OXXO.svg";
import PIX from "./svg32x22/PIX.svg";
import PayEasy from "./svg32x22/Pay-easy.svg";
import PayPal from "./svg32x22/PayPal.svg";
import Payconiq from "./svg32x22/Payconiq.svg";
import Paysafecard from "./svg32x22/Paysafecard.svg";
import Przelewy24 from "./svg32x22/Przelewy24.svg";
import Satispay from "./svg32x22/Satispay.svg";
import SepaDebit from "./svg32x22/Sepa Debit.svg";
import Skrill from "./svg32x22/Skrill.svg";
import Todito from "./svg32x22/Todito.svg";
import TossPay from "./svg32x22/TossPay.svg";
import TouchNGo from "./svg32x22/Touch 'n Go.svg";
import Trustly from "./svg32x22/Trustly.svg";
import UPI from "./svg32x22/UPI.svg";
import UnionPay from "./svg32x22/UnionPay.svg";
import Visa from "./svg32x22/Visa.svg";
import WeChatPay from "./svg32x22/WeChat Pay.svg";
import ZIP from "./svg32x22/ZIP.svg";
import PbBa from "./svg32x22/PbBa.svg";
import PayU from "./svg32x22/PayU.svg";
import Klasha from "./svg32x22/Klasha.svg";
import KlashaTransfer from "./svg32x22/KlashaTransfer.svg";
import MobileMoney from "./svg32x22/MobileMoney.svg";
import MPESA from "./svg32x22/MPESA.svg";
import WEMABank from "./svg32x22/WEMABank.svg";
import CardAfrica from "./svg32x22/CardAfrica.svg";
import Klarna from "./svg32x22/Klarna.svg";
import MBWay from "./svg32x22/MBWay.svg";
import ThaiBanks from "./svg32x22/ThaiBanks.svg";
import ClearPay from "./svg32x22/ClearPay.svg";
import OnlineBanking from "./svg32x22/OnlineBanking.svg";
import AfterPay from "./svg32x22/AfterPay.svg";
import Doku from "./svg32x22/Doku.svg";
import Shoppee from "./svg32x22/Shoppee.svg";
import TrueMoney from "./svg32x22/TrueMoney.svg";
import Kbank from "./svg32x22/Kbank.svg";
import ThaiQr from "./svg32x22/ThaiQr.svg";
import CardUs from "./svg32x22/CardUs.svg";
import kakaopay from "./ali/kakaopay.svg";
import tmn from "./ali/tmn.svg";
import mpay from "./ali/mpay.svg";
import rabbitlinepay from "./ali/rabbitlinepay.svg";
import boost from "./ali/boost.svg";
import bpi from "./ali/bpi.svg";
import tng from "./ali/tng.svg";
import dana from "./ali/dana.svg";
import alipayhk from "./ali/alipayhk.svg";
import gcash from "./ali/gcash.svg";
import Tinaba from "./ali/Tinaba.svg";
import Kredivo from "./ali/Kredivo.svg";
import NAVER from "./ali/NAVER.svg";
import kplus from "./ali/kplus.svg";
import billease from "./ali/billease.svg";
import alipaycn from "./ali/alipaycn.svg";
import easylink from "./svg32x22/easylink.svg";
import QuickPass from "./svg32x22/QuickPass.svg";
import { isDebug } from '../../utils/isDev';
import { StaticImageData } from "next/image";

const PayIconMap = {
  "alipay": [alipaycn, '#1777FF'],
  "americanexpress": [AmericanExpress, '#fff'],
  "applepay": [ApplePay, '#fff'],
  "applepayus": [ApplePay, '#fff'],
  "bancomatpay": [BANCOMATPay, '#fff'],
  "blikoneclick": [BLIKOneClick, '#080808'],
  "blik": [BLIK, '#080808'],
  "bitpay": [BitPay, '#fff'],
  "cashapppay": [CashAppPay, '#fff'],
  "duitnow": [DuitNow, '#fff'],
  "eps": [EPS, '#fff'],
  "fpxonlinebanking": [FPXOnlineBanking, '#fff'],
  "fpx": [FPXOnlineBanking, '#fff'],
  "finlandbanks": [FinlandBanks, '#fff'],
  "giropay": [Giropay, '#000267'],
  "gopay": [GoPay, '#02AFD9'],
  "googlepay": [GooglePay, ''],
  "googlepayus": [GooglePay, ''],
  "indonesiabanks": [IndonesiaBanks, '#fff'],
  "jcb": [JCB, '#fff'],
  "konbini": [Konbini, '#fff'],
  "koreandomesticcards": [KoreanDomesticCards, '#fff'],
  "mbbank": [MBbank, '#fff'],
  "mastercard": [Mastercard, '#fff'],
  "mybank": [MyBank, '#fff'],
  "oxxo": [OXXO, '#fff'],
  "pix": [PIX, '#fff'],
  "payeasy": [PayEasy, '#fff'],
  "paypal": [PayPal, '#fff'],
  "payconiq": [Payconiq, '#fff'],
  "paysafecard": [Paysafecard, '#fff'],
  "p24": [Przelewy24, '#fff'],
  "przelewy24": [Przelewy24, '#fff'],
  "przelewy24p24": [Przelewy24, '#fff'],
  "satispay": [Satispay, '#F94C43'],
  "sepadebit": [SepaDebit, '#000000'],
  "sepaddmodelc": [SepaDebit, '#000000'],
  "sepaddmodela": [SepaDebit, '#000000'],
  "skrill": [Skrill, '#fff'],
  "todito": [Todito, '#fff'],
  "tosspay": [TossPay, '#1A63D6'],
  "touchngo": [TouchNGo, '#292C69'],
  "trustly": [Trustly, '#fff'],
  "upi": [UPI, '#fff'],
  "unionpay": [UnionPay, '#fff'],
  "visa": [Visa, '#00112C'],
  "wechatpay": [WeChatPay, '#fff'],
  "zip": [ZIP, '#fff'],
  "zipus": [ZIP, '#fff'],
  "pbba": [PbBa, '#fff'],
  "paybybankapp": [PbBa, '#fff'],
  "paybybankapppbba": [PbBa, '#fff'],
  "payu": [PayU, '#fff'],
  "klasha": [Klasha, '#fff'],
  "card": [Klasha, '#fff'],
  "banktransaction": [KlashaTransfer, '#fff'],
  "mobilemoney": [MobileMoney, '#fff'],
  "mpesa": [MPESA, '#fff'],
  "wemabank": [WEMABank, '#990D81'],
  "cardafrica": [CardAfrica, '#00112C'],
  "afterpay": [AfterPay, '#fff'],
  "klarna": [Klarna, '#fff'],
  "payovertimeklarna": [Klarna, '#fff'],
  "paylaterklarna": [Klarna, '#fff'],
  "paynowklarna": [Klarna, '#fff'],
  "banktransferklarna": [CardAfrica, '#fff'],
  "directdebitklarna": [Klarna, '#fff'],
  "upiinstore": [UPI, '#fff'],
  "mbway": [MBWay, '#fff'],
  "thaibanks": [ThaiBanks, '#fff'],
  "thaibanksapp": [ThaiBanks, '#fff'],
  "skrilltap": [Skrill, '#fff'],
  "clearpay": [ClearPay, '#fff'],
  "onlinebanking": [OnlineBanking, '#fff'],
  "doku": [Doku, '#E2261C'],
  "shoppepay": [Shoppee, '#EE4D2D'],
  "shopeepay": [Shoppee, '#EE4D2D'],
  "truemoney": [TrueMoney, '#fff'],
  "kbank": [Kbank, '#fff'],
  "kodd": [Kbank, '#fff'],
  "thaiqr": [ThaiQr, '#133E67'],
  "cardsus": [CardUs, '#4480CA'],
  "koreancard": [CardUs, '#4480CA'],
  "kakaopay": [kakaopay, '#FFEB03'],
  "tmn": [tmn, '#fff'],
  "mpay": [mpay, '#FF8300'],
  "rabbitlinepay": [rabbitlinepay, '#fff'],
  "boost": [boost, '#EA0029'],
  "bpi": [bpi, '#fff'],
  "tng": [tng, '#295DAA'],
  "dana": [dana, '#fff'],
  "alipayhk": [alipayhk, '#fff'],
  "gcash": [gcash, '#fff'],
  "tsp": [TossPay, '#1A63D6'],
  "tinaba": [Tinaba, '#fff'],
  "kredivo": [Kredivo, '#fff'],
  "naverpay": [NAVER, '#00DE5A'],
  "kplus": [kplus, '#fff'],
  "billease": [billease, '#fff'],
  "alipaycn": [alipaycn, '#1777FF'],
  "creditcardupop": [easylink, '#fff'],
  "alipayup": [alipaycn, '#1777FF'],
  "upop": [UnionPay, '#fff'],
  "wechatpayup": [WeChatPay, '#fff'],
  "qp": [QuickPass, '#fff'],
  "creditcardvm": [CardUs, '#4480CA'],
};

type PayIconName = keyof typeof PayIconMap;
type PayIconTuple = [component: StaticImageData, bgColor: string]
export const getIcon = (name: string, platformName: string): PayIconTuple => {
  const key1 = String(name).replace(/\W/g, '').toLowerCase();
  const key2 = String(platformName).replace(/\W/g, '').toLowerCase();
  if (!key1 || !PayIconMap[key1 as PayIconName] && !PayIconMap[key2 as PayIconName]) {
    if (isDebug())  console.warn(`No icon found for ${name}, key = ${key1}`);
  }
  return (PayIconMap[key1 as PayIconName] || PayIconMap[key2 as PayIconName]) as PayIconTuple;
};

export default PayIconMap;
