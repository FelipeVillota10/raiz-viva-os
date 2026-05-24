import json
from datetime import datetime

from .PagoLogModel import PagoLogModel

_ID_COUNTER = [0]
_LOGS = []


class PagoLogRepository:

    @staticmethod
    def registrar(id_pago: int, tipo: str, payload: dict):
        _ID_COUNTER[0] += 1
        log = PagoLogModel(
            id_log=_ID_COUNTER[0],
            id_pago_id=id_pago,
            tipo=tipo,
            payload=payload,
            fecha=datetime.now(),
        )
        _LOGS.append(log)
        resumen = json.dumps(payload, default=str, ensure_ascii=False)[:500]
        print(f"[PagoLog] tipo={tipo} id_pago={id_pago} | {resumen}")
        return log

    @staticmethod
    def obtener_log_por_id(id_log) -> PagoLogModel:
        for log in _LOGS:
            if log.id_log == id_log:
                return log
        return None

    @staticmethod
    def listar_por_pago(id_pago: int):
        return [log for log in _LOGS if log.id_pago_id == id_pago]
