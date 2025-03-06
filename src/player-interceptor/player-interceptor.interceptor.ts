import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class FilterPlayerHandInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler) {
        // Supposons que l'id du joueur connecté se trouve dans la requête
        const request = context.switchToHttp().getRequest();
        const currentPlayerId = request.player.sub;

        return next.handle().pipe(
            map(data => {
                if (data && data.players) {
                    data.players = data.players.map((player: any) => {
                        // Toujours retirer le password
                        let { id, password, hand, ...rest } = player;
                        // Si le joueur connecté, on restaure sa main, sinon on la garde supprimée
                        if (player.id === currentPlayerId) {
                            return { ...rest, hand, };
                        }
                        return rest;
                    });
                }
                return data;
            }),
        );
    }
}