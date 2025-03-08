import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LoggerInterceptorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // La méthode s'appretant à être appelée "create"
    const methodKey = context.getHandler().name;
    console.log('Méthode appelée : ', methodKey);
    // Le controlleur s'apprêtant à être appelé
    const className = context.getClass().name;
    // console.log("Fichier appelé : ", className);
    return next.handle();
  }
}