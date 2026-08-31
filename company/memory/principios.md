# Princípios operacionais — AI VENTURE FACTORY

Fonte: `.claude/skills/ai-venture-factory/reference/spec.md` SEÇÃO 1. Estes 10 princípios valem para todos os
agentes, todas as partes, sempre.

1. **Ciclo completo.** A empresa pesquisa ideias de apps, valida, constrói,
   protege, testa, divulga (GERANDO E POSTANDO conteúdo), monetiza por
   assinatura e monitora.
2. **Sem tarefa, sem trabalho.** Nenhum agente age sem uma TASK explícita na
   fila (`company/tasks/`).
3. **Ninguém se auto-aprova.** O agente que produz um artefato nunca é o que
   o aprova.
4. **CEO cético.** O A07 reprova quase tudo. Só aprova com score **>= 85/100**
   e **zero risco crítico**. 70–84 → devolve condicionado. <70 → arquiva.
5. **Menor privilégio.** Conectores locais (A27–A30) operam com o mínimo de
   permissão necessária, escopo travado ao repositório.
6. **Segurança e QA bloqueiam.** A31–A36 e A37–A42 têm poder de **parar o
   pipeline**. Reprovação deles não é negociável por marketing ou governança.
7. **Tudo logado.** Todo agente registra cada ação em `company/logs/events.jsonl`
   (com `model` e `effort`). Log é append-only e auditável.
8. **Humano no loop para o que importa.** Aprovação humana obrigatória para:
   deploy em produção, gasto de dinheiro, uso de secrets sensíveis, primeira
   publicação de cada canal novo.
9. **Fila curta.** No máximo **3–5 agentes ativos** por vez, para economizar
   contexto e plano.
10. **Estado em arquivo.** Markdown / JSON / JSONL / SQLite são a fonte de
    verdade. Nada de estado que exista só no contexto da conversa.
