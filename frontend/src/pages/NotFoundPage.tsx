import { Link } from "react-router";
import { Button } from "../components/atoms/Button";

export function NotFoundPage() {
  return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="font-heading text-[120px] text-accent leading-none mb-4">404</div>
        <h1 className="font-heading text-4xl mb-4">Страница не найдена</h1>
        <p className="text-muted-foreground mb-8">
          Страница, которую вы ищете, не существует или была перемещена
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/">
            <Button variant="primary">На главную</Button>
          </Link>
          <Link to="/catalogue">
            <Button variant="ghost">Перейти в каталог</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
