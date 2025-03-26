/* eslint-disable */
import React from 'react';
// @ts-ignore
import kma from "./banks/kma.png?url";
// @ts-ignore
import kplus from "./banks/kplus.webp?url";
// @ts-ignore
import scb from "./banks/scb.jpeg?url";
// @ts-ignore
import Barclays from "./banks/barclays.webp?url";
// @ts-ignore
import HSBC from "./banks/hsbc.png?url";
// @ts-ignore
import NatWest from "./banks/NatWest.jpeg?url";
// @ts-ignore
import Maybank from "./banks/maybank.jpeg?url";
// @ts-ignore
import OCBC from "./banks/ocbc.jpg?url";
// @ts-ignore
import kasikornbank from "./banks/kasikornbank.png?url";
// @ts-ignore
import krungthaibank from "./banks/krungthaibank.png?url";
// @ts-ignore
import bangkokbank from "./banks/bangkokbank.jpg?url";
// @ts-ignore
import AffinBank from "./banks/AffinBank.png?url";
// @ts-ignore
import agrobank from "./banks/agrobank.webp?url";
// @ts-ignore
import AllianceBank from "./banks/AllianceBank.png?url";
// @ts-ignore
import AmBank from "./banks/AmBank.webp?url";
// @ts-ignore
import BankIslam from "./banks/BankIslam.png?url";
// @ts-ignore
import BankBankrakyat from "./banks/BankBankrakyat.webp?url";
// @ts-ignore
import BankMuamalat from "./banks/BankMuamalat.png?url";
// @ts-ignore
import BankSimpananNasional from "./banks/BankSimpananNasional.png?url";
// @ts-ignore
import CIMBBank from "./banks/CIMBBank.png?url";
// @ts-ignore
import HongLeongBank from "./banks/HongLeongBank.png?url";
// @ts-ignore
import KuwaitFinanceHouse from "./banks/KuwaitFinanceHouse.png?url";
// @ts-ignore
import PublicBank from "./banks/PublicBank.jpg?url";
// @ts-ignore
import RHB from "./banks/RHB.png?url";
// @ts-ignore
import StandardCharteredBank from "./banks/StandardCharteredBank.jpeg?url";
// @ts-ignore
import UOB from "./banks/UOB.png?url";
/* eslint-enable */
type Props = {
  name: string
}
const BankIcon: React.FC<Props> = ({ name }) => {
  switch (name?.toUpperCase()) {
    case "KMA":
    case "BANKOFAYUDHYA":
      return <img src={kma} alt="Korean Metal Association"/>;
    case "KPLUS":
      return <img src={kplus} alt="K Plus Bank"/>;
    case "SCB":
    case "SIAMCOMMERCIALBANK":
      return <img src={scb} alt="SCB"/>;
    case "BARCLAYS":
      return <img src={Barclays} alt="Barclays"/>;
    case "HSBC":
    case "HSBC (HONG KONG AND SHANGHAI BANKING CORPORATION)".replace(/ /g, ""):
      return <img src={HSBC} alt="HSBC"/>;
    case "NATWEST":
      return <img src={NatWest} alt="NatWest"/>;
    case "MAYBANK":
      return <img src={Maybank} alt="Maybank"/>;
    case "OCBC":
    case "OCBC BANK".replace(/ /g, ""):
      return <img src={OCBC} alt="OCBC"/>;
    case "KASIKORNBANK":
      return <img src={kasikornbank} alt="kasikornbank"/>;
    case "KRUNGTHAIBANK":
      return <img src={krungthaibank} alt="krungthaibank"/>;
    case "BANGKOKBANK":
      return <img src={bangkokbank} alt="bangkokbank"/>;
    case "AFFIN BANK".replace(/ /g, ""):
      return <img src={AffinBank} alt="AffinBank"/>;
    case "AGROBANK":
      return <img src={agrobank} alt="agrobank"/>;
    case "ALLIANCE BANK".replace(/ /g, ""):
      return <img src={AllianceBank} alt="AllianceBank"/>;
    case "AMBANK":
      return <img src={AmBank} alt="AmBank"/>;
    case "BANK ISLAM".replace(/ /g, ""):
      return <img src={BankIslam} alt="BankIslam"/>;
    case "BANKRAKYAT":
    case "BANK KERJASAMA RAKYAT MALAYSIA".replace(/ /g, ""):
      return <img src={BankBankrakyat} alt="BankBankrakyat"/>;
    case "BANK MUAMALAT".replace(/ /g, ""):
      return <img src={BankMuamalat} alt="BankMuamalat"/>;
    case "BANK SIMPANAN".replace(/ /g, ""):
    case "BANK SIMPANAN NASIONAL".replace(/ /g, ""):
      return <img src={BankSimpananNasional} alt="BankSimpananNasional"/>;
    case "CIMB":
    case "CIMB BANK".replace(/ /g, ""):
      return <img src={CIMBBank} alt="CIMBBank"/>;
    case "HONG LEONG".replace(/ /g, ""):
    case "HONG LEONG BANK".replace(/ /g, ""):
      return <img src={HongLeongBank} alt="HongLeongBank"/>;
    case "KUWAIT FINANCE HOUSE".replace(/ /g, ""):
      return <img src={KuwaitFinanceHouse} alt="KuwaitFinanceHouse"/>;
    case "PUBLIC BANK".replace(/ /g, ""):
      return <img src={PublicBank} alt="PublicBank"/>;
    case "RHB":
    case "RHB BANK".replace(/ /g, ""):
      return <img src={RHB} alt="BHB"/>;
    case "STANDARD CHARTERED".replace(/ /g, ""):
    case "STANDARD CHARTERED BANK".replace(/ /g, ""):
      return <img src={StandardCharteredBank} alt="StandardCharteredBank"/>;
    case "UOB":
    case "UNITED OVERSEAS BANK".replace(/ /g, ""):
    case "UNITED OVERSEAS BANK (UOB)".replace(/ /g, ""):
      return <img src={UOB} alt="United Overseas Bank"/>;
    default:
      return null;
  }
};

export default BankIcon;
