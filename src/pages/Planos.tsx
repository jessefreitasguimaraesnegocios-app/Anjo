import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Clock } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Planos() {
  const { getSubscription, upgradeToMonthly, isSubscriptionActive, getDaysRemaining } = useSubscription();
  const queryClient = useQueryClient();

  // Fetch subscription
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: getSubscription,
  });

  // Upgrade mutation
  const upgradeMutation = useMutation({
    mutationFn: upgradeToMonthly,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Upgrade realizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao fazer upgrade');
    },
  });

  const handleUpgrade = () => {
    // Em produção, aqui seria integrado com Stripe/PagSeguro
    toast.info('Redirecionando para pagamento...', {
      description: 'Esta funcionalidade será implementada em breve'
    });
  };

  const isActive = isSubscriptionActive(subscription);
  const daysRemaining = getDaysRemaining(subscription);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando planos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Planos e Valores
          </h1>
          <p className="text-muted-foreground text-lg">
            Escolha o melhor plano para sua segurança
          </p>
          
          {/* Current Status */}
          {subscription && (
            <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary rounded-full">
              {subscription.plan_type === 'free_trial' ? (
                <>
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-primary font-semibold">
                    Trial Ativo - {daysRemaining} dias restantes
                  </span>
                </>
              ) : (
                <>
                  <Crown className="h-5 w-5 text-primary" />
                  <span className="text-primary font-semibold">
                    Plano Mensal Ativo
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Current Plan Status */}
        {subscription && (
          <Card className="max-w-2xl mx-auto mb-8 p-6 bg-gradient-card">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">
                {subscription.plan_type === 'free_trial' ? 'Trial Gratuito' : 'Plano Mensal'}
              </h2>
              <p className="text-muted-foreground mb-4">
                {subscription.plan_type === 'free_trial' 
                  ? `${daysRemaining} dias restantes no seu trial gratuito`
                  : 'Sua assinatura está ativa'
                }
              </p>
              <Badge 
                variant={isActive ? "outline" : "secondary"}
                className={isActive ? "bg-success/10 text-success border-success" : ""}
              >
                {isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </Card>
        )}

        {/* Plano Principal */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card className={`p-8 bg-gradient-card border-primary shadow-glow ${
            subscription?.plan_type === 'monthly' ? 'ring-2 ring-primary' : ''
          }`}>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 mb-4">
                <Crown className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Plano Mensal</h2>
              </div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-primary">R$ 100</span>
                <span className="text-muted-foreground text-xl">/mês</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-success/20 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-success" />
                </div>
                <span className="text-foreground">Todos os recursos básicos</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-success/20 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-success" />
                </div>
                <span className="text-foreground">Armazenamento de 5GB</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-success/20 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-success" />
                </div>
                <span className="text-foreground">Suporte por email</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-success/20 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-success" />
                </div>
                <span className="text-foreground">3 dispositivos conectados</span>
              </li>
            </ul>

            {subscription?.plan_type === 'free_trial' ? (
              <Button 
                variant="default" 
                size="lg" 
                className="w-full text-lg"
                onClick={handleUpgrade}
                disabled={upgradeMutation.isPending}
              >
                {upgradeMutation.isPending ? 'Processando...' : 'Fazer Upgrade Agora'}
              </Button>
            ) : (
              <div className="text-center">
                <Badge variant="outline" className="bg-success/10 text-success border-success mb-4">
                  Plano Ativo
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Sua assinatura está ativa até {subscription?.expires_at && 
                    new Date(subscription.expires_at).toLocaleDateString()
                  }
                </p>
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground mt-4">
              Cancele a qualquer momento • Sem compromisso
            </p>
          </Card>
        </div>

        {/* Recursos Adicionais */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Recursos Adicionais</h2>
          <p className="text-center text-muted-foreground mb-8">
            Adicione funcionalidades extras conforme sua necessidade
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { nome: "Download Áudio", preco: "R$ 10", icone: "🎵", descricao: "Por arquivo de áudio" },
              { nome: "Download Vídeo", preco: "R$ 20", icone: "🎥", descricao: "Por arquivo de vídeo" },
              { nome: "Download Localização", preco: "R$ 30", icone: "📍", descricao: "Por arquivo de localização" },
              { nome: "Modo Live", preco: "R$ 50", icone: "📡", descricao: "Por sessão de transmissão ao vivo" },
            ].map((adicional, index) => (
              <Card key={index} className="p-6 hover:shadow-glow transition-all">
                <div className="text-center">
                  <div className="text-4xl mb-3">{adicional.icone}</div>
                  <h3 className="font-semibold text-lg mb-2">{adicional.nome}</h3>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {adicional.preco}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {adicional.descricao}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                  >
                    Adicionar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ / Informações */}
        <Card className="p-8 max-w-2xl mx-auto bg-muted/50">
          <h3 className="text-xl font-semibold mb-4 text-center">
            Informações Importantes
          </h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Todos os novos usuários ganham 3 dias grátis para testar todos os recursos</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Os recursos adicionais podem ser comprados individualmente conforme necessário</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Pagamento seguro via PIX, cartão de crédito ou boleto bancário</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Cancele sua assinatura a qualquer momento sem taxas adicionais</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Suporte técnico disponível por email e chat durante o horário comercial</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}