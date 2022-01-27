class Api {
    constructor(link) {
        this.link = link;
    }
    async get(entity) { //renvoie les donnee dans un tableau
        return await $.ajax({
            url: this.link,
            method: "GET",
            datatype: "json",
            data: entity,
            contentType: 'application/json; charset=utf-8'
        }).done((data) => data);
    }
    async post(entity) {
        return await $.ajax({
            url: this.link,
            method: "POST",
            datatype: "json",
            data: JSON.stringify(entity),
            contentType: 'application/json; charset=utf-8'
        }).done((data) => data);
    }
    async delete({ id, _csrf, getParameter }) {
        return await $.ajax({
            url: this.link + '/' + id+'?_csrf='+_csrf+'&'+getParameter,
            method: "DELETE",
            datatype: "json",
            contentType: 'application/json; charset=utf-8'
        }).done((data) => data);
    }

    async getItem({id}) {
        return await $.ajax({
            url: this.link+'/'+ id,
            method: "GET",
            datatype: "json",
            contentType: 'application/json; charset=utf-8'
        })

            .done((data) => data);

    }

    async put(entity) {
        if (typeof entity.id != 'undefined')
            return await $.ajax({
                url: this.link +'/'+ entity.id,
                method: "PUT",
                datatype: "json",
                data: JSON.stringify(entity),
                contentType: 'application/json; charset=utf-8'
            })

                .done((data) => data);


    }

    async postFile({ file, _csrf }) {
        console.log('postFile', file);
        return await $.ajax({
            url: this.link+'?_csrf='+_csrf,
            type: "POST",
            //method: "POST",
            /*datatype: "json",*/
            data: file,
            contentType: false,
            processData: false,
            //cache: false
        })
            .done((data) => data);
    }

}
