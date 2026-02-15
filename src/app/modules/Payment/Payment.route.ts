import { Router } from "express"
import auth from "../../middlewares/auth"
import { USER_ROLES } from "../../../enums/user"
import { PaymentController } from "./paymentController"
// import { handlePayment } from "../../../handlers/handlePaymentSuccess";


const router = Router()

router.route("/buy-credit/:id").post(auth(USER_ROLES.USER), PaymentController.buyMoneyCredits)
router.get('/success', PaymentController.paymentSuccess);
router.get('/cancel', PaymentController.paymentCancel);



export const PaymentRouter = router