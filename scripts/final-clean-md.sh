#!/bin/bash

# Final cleanup of remaining Cyrillic in MD files

cd /home/ivan/git/workix

# Target only project files, not node_modules
find . -name "*.md" -type f -not -path "./node_modules/*" -exec grep -l '[а-яё]' {} \; 2>/dev/null | while read -r file; do
    echo "Final cleaning: $file"

    # Final cleanup of remaining phrases
    sed -i \
        -e 's/для API Gateway/for API Gateway/g' \
        -e 's/в проекте/in project/g' \
        -e 's/для dev/for dev/g' \
        -e 's/Найдено в проекте/Found in project/g' \
        -e 's/Использование/Usage/g' \
        -e 's/Kubernetes Rolling Updates/Kubernetes Rolling Updates/g' \
        -e 's/API Gateway/API Gateway/g' \
        -e 's/Zero-Downtime/Zero-Downtime/g' \
        -e 's/Health Checks/Health Checks/g' \
        -e 's/Docker Compose/Docker Compose/g' \
        -e 's/Rolling Updates/Rolling Updates/g' \
        -e 's/Deployment Guide/Deployment Guide/g' \
        -e 's/Kubernetes/Kubernetes/g' \
        -e 's/Refactoring/Refactoring/g' \
        -e 's/Implementation/Implementation/g' \
        -e 's/Architecture/Architecture/g' \
        -e 's/Versioning/Versioning/g' \
        -e 's/Strategy/Strategy/g' \
        -e 's/Comparison/Comparison/g' \
        -e 's/Schema/Schema/g' \
        -e 's/Lightweight/Lightweight/g' \
        -e 's/Routing/Routing/g' \
        -e 's/Service/Service/g' \
        -e 's/Specific/Specific/g' \
        -e 's/ArgoCD/ArgoCD/g' \
        -e 's/Tasks/Tasks/g' \
        -e 's/Plan/Plan/g' \
        -e 's/Diagram/Diagram/g' \
        -e 's/Gateway/Gateway/g' \
        -e 's/уже/already/g' \
        -e 's/есть/exists/g' \
        -e 's/настроен/configured/g' \
        -e 's/настроена/configured/g' \
        -e 's/настроено/configured/g' \
        -e 's/настроены/configured/g' \
        -e 's/найдено/found/g' \
        -e 's/найдена/found/g' \
        -e 's/найдены/found/g' \
        -e 's/проект/project/g' \
        -e 's/проекта/project/g' \
        -e 's/проекте/project/g' \
        -e 's/проектов/projects/g' \
        -e 's/проектам/projects/g' \
        -e 's/проектами/projects/g' \
        -e 's/использование/usage/g' \
        -e 's/использования/usage/g' \
        -e 's/использует/uses/g' \
        -e 's/использовать/use/g' \
        -e 's/использованы/used/g' \
        -e 's/использована/used/g' \
        -e 's/использован/used/g' \
        -e 's/для/for/g' \
        -e 's/при/when/g' \
        -e 's/через/via/g' \
        -e 's/после/after/g' \
        -e 's/перед/before/g' \
        -e 's/без/without/g' \
        -e 's/над/over/g' \
        -e 's/под/under/g' \
        -e 's/между/between/g' \
        -e 's/среди/among/g' \
        -e 's/внутри/inside/g' \
        -e 's/снаружи/outside/g' \
        -e 's/рядом/near/g' \
        -e 's/далеко/far/g' \
        -e 's/близко/close/g' \
        -e 's/здесь/here/g' \
        -e 's/там/there/g' \
        -e 's/где/where/g' \
        -e 's/когда/when/g' \
        -e 's/как/how/g' \
        -e 's/что/what/g' \
        -e 's/кто/who/g' \
        -e 's/почему/why/g' \
        -e 's/зачем/why/g' \
        -e 's/откуда/from where/g' \
        -e 's/куда/where to/g' \
        -e 's/сколько/how much/g' \
        -e 's/много/many/g' \
        -e 's/мало/few/g' \
        -e 's/больше/more/g' \
        -e 's/меньше/less/g' \
        -e 's/лучше/better/g' \
        -e 's/хуже/worse/g' \
        -e 's/быстрее/faster/g' \
        -e 's/медленнее/slower/g' \
        -e 's/выше/higher/g' \
        -e 's/ниже/lower/g' \
        -e 's/больший/larger/g' \
        -e 's/меньший/smaller/g' \
        -e 's/новый/new/g' \
        -e 's/старый/old/g' \
        -e 's/первый/first/g' \
        -e 's/последний/last/g' \
        -e 's/следующий/next/g' \
        -e 's/предыдущий/previous/g' \
        -e 's/другой/other/g' \
        -e 's/такой/such/g' \
        -e 's/этот/this/g' \
        -e 's/тот/that/g' \
        -e 's/все/all/g' \
        -e 's/каждый/each/g' \
        -e 's/любой/any/g' \
        -e 's/некоторый/some/g' \
        -e 's/никакой/none/g' \
        -e 's/один/one/g' \
        -e 's/два/two/g' \
        -e 's/три/three/g' \
        -e 's/четыре/four/g' \
        -e 's/пять/five/g' \
        -e 's/шесть/six/g' \
        -e 's/семь/seven/g' \
        -e 's/восемь/eight/g' \
        -e 's/девять/nine/g' \
        -e 's/десять/ten/g' \
        "$file"

    echo "Final cleaned: $file"
done

echo "Final cleanup completed!"
